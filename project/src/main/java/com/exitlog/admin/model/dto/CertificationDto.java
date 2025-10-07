package com.exitlog.admin.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime; // 또는 String으로 포맷팅된 날짜

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDto {
    private Integer certificateNo;        // employment_certificate.CERTIFICATE_NO
    private Integer userNo;               // user.USER_NO
    private String userId;                // user.USER_ID
    private String companyName;           // employment_certificate.COMPANY_NAME
    private String userCreatedDate;       // user.CREATED_DATE (포맷팅된 문자열)
    private String certificateUploadDate; // employment_certificate.UPLOAD_DATE (포맷팅된 문자열)

    private String status;                // employment_certificate.STATUS (PENDING, APPROVED, REJECTED)
    private String statusText;            // 상태 한글명 (대기중, 인증완료, 반려됨)
    private String statusBadgeClass;      // 부트스트랩 배지 클래스

    private String documentName;          // 제출 서류명 (예: "재직증명서")
    private String documentWebUrl;        // 제출 서류 웹 접근 URL (예: "/images/certificate.jpg")
    private String originalFilePath;      // 원본 파일 경로 (DB에 저장된 값) employment_certificate.FILE_PATH
}