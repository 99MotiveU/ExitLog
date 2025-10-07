package com.exitlog.admin.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReportSubmissionDto {
    private Integer logNo;
    private String repoReason;
    // private String repoDetail; // 상세 내용 필드가 있다면 추가
}
