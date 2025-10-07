package com.exitlog.admin.model.entity;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    private Integer repoNo; // PK
    private int logNo;
    private int userNo; // 신고자 user_no
    private String repoReason;
    private LocalDateTime repoDate; // 신고일 (서버에서 설정)
    private boolean isDel; // 이 신고 건 자체의 삭제 여부
}