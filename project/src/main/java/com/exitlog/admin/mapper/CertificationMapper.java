package com.exitlog.admin.mapper;

import com.exitlog.admin.model.dto.CertificationDto;
import com.exitlog.admin.model.dto.CertificationProcessDetailDto;

import org.apache.ibatis.annotations.Mapper;
// import org.apache.ibatis.annotations.Param; // Map을 단일 파라미터로 사용할 경우, 개별 필드에 @Param 불필요

import java.util.List;
import java.util.Map; // Map 임포트 확인

@Mapper
public interface CertificationMapper {

	/**
     * (수정) 정렬 및 페이지네이션 조건에 맞는 재직 인증 요청 목록을 조회합니다.
     * @param params Map에 다음 키 포함: "sortColumn", "sortDirection", "offset", "limit"
     * @return CertificationDto 리스트
     */
    List<CertificationDto> findCertificationRequests(Map<String, Object> params);

    /**
     * (신규) 재직 인증 요청 목록의 전체 개수를 조회합니다.
     * (페이지네이션 계산용 - 검색 기능 추가 시 검색 조건도 파라미터로 받을 수 있음)
     * @return 전체 재직 인증 요청 수
     */
    int countCertificationRequests(); // 파라미터 없이 전체 개수 (향후 검색 기능 추가 시 파라미터 필요)
    
    /**
     * 재직 인증 요청의 상태(STATUS)와 수정일(UPDATE_DATE)을 업데이트합니다.
     * @param params 업데이트할 내용을 담은 Map. 다음 키를 포함해야 합니다:
     * - "certificateNo" (Integer): 업데이트할 인증서 번호
     * - "newStatus" (String): 새로운 상태 값 (예: "APPROVED", "REJECTED")
     * - "updateDate" (LocalDateTime 또는 Date): 수정된 날짜 및 시간
     * @return 업데이트된 행의 수 (보통 1 또는 0)
     */
    int updateCertificationStatus(Map<String, Object> params);
    
    /**
     * 특정 사용자의 회사명(COMPANY_NAME)을 user 테이블에서 업데이트합니다.
     * @param params 업데이트할 내용을 담은 Map. 다음 키를 포함해야 합니다:
     * - "userNo" (Integer): 업데이트할 사용자의 USER_NO
     * - "companyName" (String): 새로 등록할 회사명
     * @return 업데이트된 행의 수 (보통 1 또는 0)
     */
    int updateUserCompanyName(Map<String, Object> params);

    /**
     * 특정 재직 인증 요청의 상세 정보(USER_NO, 요청된 COMPANY_NAME)를 조회합니다.
     * @param certificateNo 조회할 인증서 번호
     * @return CertificationProcessDetailDto 객체
     */
    CertificationProcessDetailDto findCertificationDetailById(Integer certificateNo); // 반환 타입 변경
    
    /**
     * 사용자 번호(USER_NO)로 해당 사용자의 현재 회사명(COMPANY_NAME)을 user 테이블에서 조회합니다.
     * @param userNo 조회할 사용자의 USER_NO
     * @return 사용자의 COMPANY_NAME (없으면 null)
     */
    String findUserCurrentCompanyName(Integer userNo);
    
}