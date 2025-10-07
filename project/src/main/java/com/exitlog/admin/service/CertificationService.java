package com.exitlog.admin.service;

import com.exitlog.admin.model.dto.CertificationDto;
import com.exitlog.pagination.LogPagination;

import java.util.List;

public interface CertificationService {

	/**
     * (수정) 정렬 및 페이지네이션 조건에 맞는 재직 인증 요청 목록을 조회합니다.
     * @param pagination 페이지네이션 정보 객체
     * @param sortColumn 정렬할 컬럼명
     * @param sortDirection 정렬 방향 ("ASC" 또는 "DESC")
     * @return 재직 인증 요청 DTO 리스트
     */
    List<CertificationDto> getAllCertificationRequests(LogPagination pagination, String sortColumn, String sortDirection);

    /**
     * (신규) 재직 인증 요청 목록의 전체 개수를 조회합니다.
     * (페이지네이션 계산용 - 향후 검색 기능 추가 시 검색 조건 파라미터 필요)
     * @return 전체 재직 인증 요청 수
     */
    int getCertificationRequestCount();

    boolean processCertification(Integer certificateId, String newStatus);
}