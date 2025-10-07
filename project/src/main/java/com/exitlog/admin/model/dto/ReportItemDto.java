package com.exitlog.admin.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime; // 또는 DB 타입에 맞는 java.sql.Date 등

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportItemDto {
    private int repoNo;             // 신고 번호
    private int logNo;              // 관련된 게시글 번호
    private String logTitle;        // 게시글 제목
    private int reporterUserNo;     // 신고자 회원번호
    private String reporterNickname; // 신고자 닉네임
    private String repoReason;      // 신고 사유
    private LocalDateTime repoDate;       // 신고일 (LocalDateTime으로 가정)
    private boolean processed;      // 처리 여부 (report.IS_DEL 기반)
}