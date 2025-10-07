package com.exitlog.admin.service;

import com.exitlog.admin.mapper.CertificationMapper; // MyBatis 매퍼 인터페이스
import com.exitlog.admin.model.dto.CertificationDto;  // 데이터 전송 객체 (DTO)
import com.exitlog.admin.model.dto.CertificationProcessDetailDto;
import com.exitlog.pagination.LogPagination;

import lombok.RequiredArgsConstructor;                 // Lombok: final 필드 생성자 자동 생성
import org.springframework.stereotype.Service;         // Spring 서비스 빈으로 등록
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap; // Map 구현체
import java.util.List;    // List 인터페이스
import java.util.Map;     // Map 인터페이스

/**
 * 
 */
@Service
@RequiredArgsConstructor // Lombok: final 필드에 대한 생성자를 자동으로 만들어줍니다.
public class CertificationServiceImpl implements CertificationService {

    private final CertificationMapper certificationMapper;

    @Override
    public List<CertificationDto> getAllCertificationRequests(LogPagination pagination, String sortColumn, String sortDirection) {
        Map<String, Object> params = new HashMap<>();

        // 정렬 조건 설정
        // DTO 필드명과 DB 컬럼명 매핑은 mapDtoFieldToDbColumn 메소드에서 처리
        String dbSortColumn = mapDtoFieldToDbColumn(sortColumn); 
        String dbSortDirection = "DESC"; // 기본 정렬 방향

        if (StringUtils.hasText(dbSortColumn) &&
            StringUtils.hasText(sortDirection) && 
            (sortDirection.equalsIgnoreCase("ASC") || sortDirection.equalsIgnoreCase("DESC"))) {
            params.put("sortColumn", dbSortColumn);
            params.put("sortDirection", sortDirection.toUpperCase());
        } else {
            // 기본 정렬 (컨트롤러에서 이미 기본값 처리하지만, 여기서도 방어적으로 설정)
            params.put("sortColumn", mapDtoFieldToDbColumn("certificateUploadDate")); // 기본 DTO 필드명
            params.put("sortDirection", dbSortDirection);
        }

        // 페이지네이션 조건 설정
        int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
        params.put("offset", offset);
        params.put("limit", pagination.getLimit());

        List<CertificationDto> requests = certificationMapper.findCertificationRequests(params);

        // 기존 DTO 후처리 로직 유지
        requests.forEach(dto -> {
            setStatusDetails(dto);
            dto.setDocumentWebUrl(convertToWebPath(dto.getOriginalFilePath()));
            if (!StringUtils.hasText(dto.getDocumentName())) { // StringUtils 사용
                dto.setDocumentName("제출된 증명서");
            }
        });
        return requests;
    }
    
    @Override
    public int getCertificationRequestCount() {
        // 파라미터 없이 전체 개수를 가져오는 매퍼 메소드 호출
        return certificationMapper.countCertificationRequests();
    }    
    
    /**
     * 인증 처리 메소드
     */
    @Override
    @Transactional
    public boolean processCertification(Integer certificateId, String newStatus) {
        if (certificateId == null || newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED"))) {
            System.err.println("Invalid parameters for processCertification: certificateId=" + certificateId + ", newStatus=" + newStatus);
            return false;
        }

        // 1. 처리 전, 현재 재직 인증 요청의 상세 정보(userNo, 요청된 companyName, 현재 status)를 가져옴
        CertificationProcessDetailDto certDetail = certificationMapper.findCertificationDetailById(certificateId);

        if (certDetail == null) {
            System.err.println("Certification request not found for ID: " + certificateId);
            return false; // 해당 인증 요청이 없음
        }

        // 2. employment_certificate 테이블의 상태 업데이트
        Map<String, Object> statusUpdateParams = new HashMap<>();
        statusUpdateParams.put("certificateNo", certificateId);
        statusUpdateParams.put("newStatus", newStatus);
        int updatedCertRows = certificationMapper.updateCertificationStatus(statusUpdateParams);

        if (updatedCertRows == 0) {
            System.err.println("Failed to update certification status for certificateId: " + certificateId);
            // throw new RuntimeException("인증 상태 업데이트 실패: certificateId=" + certificateId); // 필요시 예외 발생으로 트랜잭션 롤백
            return false;
        }

        // 3. user 테이블의 COMPANY_NAME 업데이트 로직
        if ("APPROVED".equals(newStatus)) {
            // "승인" 처리 시: user 테이블의 COMPANY_NAME을 현재 인증 요청의 회사명으로 업데이트
            if (certDetail.getCompanyName() != null && !certDetail.getCompanyName().trim().isEmpty()) {
                Map<String, Object> userCompanyUpdateParams = new HashMap<>();
                userCompanyUpdateParams.put("userNo", certDetail.getUserNo());
                userCompanyUpdateParams.put("companyName", certDetail.getCompanyName());
                int updatedUserRows = certificationMapper.updateUserCompanyName(userCompanyUpdateParams);
                if (updatedUserRows == 0) {
                    System.err.println("Failed to update company name for userNo: " + certDetail.getUserNo() + " on approval.");
                    // throw new RuntimeException("사용자 회사명 업데이트 실패 (승인 시): userNo=" + certDetail.getUserNo());
                    return false;
                }
            } else {
                System.err.println("Company name is missing in the certification request for approval. CertificateId: " + certificateId);
                // throw new RuntimeException("승인할 회사명이 요청에 없습니다. CertificateId: " + certificateId);
                return false;
            }
        } else if ("REJECTED".equals(newStatus) && "APPROVED".equals(certDetail.getCurrentStatus())) {
            // "반려" 처리 시 + 이전 상태가 "승인"이었을 경우:
            // user 테이블의 COMPANY_NAME을 초기화(NULL)할지 결정합니다.
            // 단, 현재 user 테이블의 COMPANY_NAME이 이전에 이 재직증명으로 인해 설정된 값과 같을 때만 초기화합니다.
            
            String currentUserCompanyName = certificationMapper.findUserCurrentCompanyName(certDetail.getUserNo());

            // Objects.equals는 두 값이 모두 null일 때도 true를 반환하므로, certDetail.getCompanyName()이 null이 아닌지 확인하는 것이 좋습니다.
            if (certDetail.getCompanyName() != null && certDetail.getCompanyName().equals(currentUserCompanyName)) {
                Map<String, Object> userCompanyClearParams = new HashMap<>();
                userCompanyClearParams.put("userNo", certDetail.getUserNo());
                userCompanyClearParams.put("companyName", null); // COMPANY_NAME을 NULL로 설정
                int updatedUserRows = certificationMapper.updateUserCompanyName(userCompanyClearParams);
                if (updatedUserRows == 0) {
                    System.err.println("Failed to clear company name for userNo: " + certDetail.getUserNo() + " on rejection.");
                    // throw new RuntimeException("사용자 회사명 초기화 실패 (반려 시): userNo=" + certDetail.getUserNo());
                    return false;
                }
            }
        }
        return true; // 모든 처리 성공
    }
    

    private String mapDtoFieldToDbColumn(String dtoField) {
        switch (dtoField) {
	        case "certificateNo":       return "ec.CERTIFICATE_NO";
	        case "userId":              return "u.USER_ID";
	        case "companyName":         return "EC_COMPANY_NAME";
	        case "certificateUploadDate": return "ec.UPLOAD_DATE";
	        case "userCreatedDate":     return "u.CREATED_DATE";
	        case "status":              return "ec.STATUS";
	        default: return "ec.UPLOAD_DATE";
        }
    }

    /**
     * CertificationDto 객체의 'status' 필드 값에 따라,
     * 화면 표시에 필요한 텍스트('statusText')와 CSS 클래스('statusBadgeClass')를 설정합니다.
     * @param dto 상태 정보를 설정할 CertificationDto 객체
     */
    private void setStatusDetails(CertificationDto dto) {
        // status 필드가 null인 경우에 대한 방어 코드
        if (dto.getStatus() == null) {
            dto.setStatusText("알 수 없음");
            dto.setStatusBadgeClass("badge-secondary");
            return; // if 블록의 내용을 채우고 return으로 조기 종료
        } 

        // status 값에 따라 분기하여 적절한 텍스트와 CSS 클래스 설정
        switch (dto.getStatus()) {
            case "PENDING":
                dto.setStatusText("대기중");
                dto.setStatusBadgeClass("badge-warning");
                break;
            case "APPROVED":
                dto.setStatusText("인증완료");
                dto.setStatusBadgeClass("badge-success");
                break;
            case "REJECTED":
                dto.setStatusText("반려됨");
                dto.setStatusBadgeClass("badge-danger");
                break;
            default:
                dto.setStatusText(dto.getStatus());
                dto.setStatusBadgeClass("badge-secondary");
        }
    }

    /**
     * 데이터베이스에 저장된 파일의 원본 경로(originalFilePath)를
     * 웹 브라우저에서 접근 가능한 URL(웹 경로)로 변환합니다.
     * @param originalFilePath DB에 저장된 파일의 원본 경로 (예: "images/certs/doc1.pdf")
     * @return 웹에서 접근 가능한 URL (예: "/images/certs/doc1.pdf")
     */
    private String convertToWebPath(String originalFilePath) {
        if (originalFilePath == null || originalFilePath.isEmpty()) {
            // 이미지가 없을 때 표시할 기본 이미지
            return "https://via.placeholder.com/100x75.png?text=No+Image";
        }

        // DB에 저장된 전체 파일 경로에서 "파일 이름"만 추출
        String fileName = new java.io.File(originalFilePath).getName();

        // WebMvcConfig에 설정된 URL 패턴인 "/upload/verify/"를 사용
        return "/upload/verify/" + fileName;
    }

}