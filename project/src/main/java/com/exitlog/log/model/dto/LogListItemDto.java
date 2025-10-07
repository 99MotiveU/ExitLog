package com.exitlog.log.model.dto;

import lombok.Data;

@Data
public class LogListItemDto {
    private int logNo;
    private String companyName;          // 게시글에 기록된 회사명 (log.COMPANY_NAME)
    private String title;
    private String nickname;             // 작성자 닉네임 (user.NICKNAME)
    private String createdDateFormatted; // 포맷팅된 작성일 (예: "yyyy.MM.dd")
    private int viewCount;
}