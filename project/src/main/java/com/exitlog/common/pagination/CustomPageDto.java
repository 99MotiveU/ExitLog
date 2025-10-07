package com.exitlog.common.pagination;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자
public class CustomPageDto<T> {
    private List<T> content;        // 현재 페이지의 데이터 목록
    private int pageNumber;         // 현재 페이지 번호 (1부터 시작)
    private int pageSize;           // 페이지 당 항목 수
    private long totalElements;     // 전체 항목 수
    private int totalPages;         // 전체 페이지 수
    private boolean isFirst;        // 첫 페이지 여부
    private boolean isLast;         // 마지막 페이지 여부
}