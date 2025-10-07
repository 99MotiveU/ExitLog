package com.exitlog.admin.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime; // DB 컬럼 타입이 DATETIME/TIMESTAMP인 경우

import com.exitlog.login.model.entity.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentCertificate {
    private Integer certificateNo;       // CERTIFICATE_NO (PK)
    private Integer userNo;              // USER_NO (FK) - UserEntity를 직접 참조하기보다, MyBatis resultMap에서 association으로 처리
    private String companyName;
    private LocalDateTime uploadDate;    // UPLOAD_DATE
    private String filePath;             // FILE_PATH
    private LocalDateTime updateDate;    // UPDATE_DATE
    private String status;               // STATUS (PENDING, APPROVED, REJECTED)

    // JOIN된 사용자 정보를 담기 위한 필드 (MyBatis resultMap의 <association>으로 채워짐)
    private User user;
}