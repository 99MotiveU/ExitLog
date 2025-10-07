package com.exitlog.admin.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime; // JSON 변환 및 표시용

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportEntryDto {
    private String reporterNickname;
    private String reason;
    private LocalDateTime reportDate; // Service에서 Report의 Date를 변환하여 설정
}