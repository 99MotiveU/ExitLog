package com.exitlog.admin.model.dto; // dto 패키지로 변경

import lombok.Data;

@Data
public class CertificationProcessDetailDto { // 클래스명 DTO 스타일로 변경
    private Integer userNo;
    private String companyName; // employment_certificate 테이블의 COMPANY_NAME
    private String currentStatus;  // employment_certificate 테이블의 현재 STATUS (업데이트 전 상태)
}