package com.exitlog.admin.service;

import java.util.List;

import com.exitlog.admin.model.dto.ReportItemDto;
import com.exitlog.admin.model.dto.ReportSubmissionDto;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.pagination.LogPagination;

public interface ReportService {
	/**
     * 관리자 페이지에 표시될 신고된 게시글의 페이지네이션된 목록을 가져옵니다.
     * @param pagination 페이지네이션 정보 객체
     * @return LogPost 리스트
     */
    List<LogPostDetailDto> getPagedReportedLogList(LogPagination pagination);

    /**
     * 관리자 페이지에 표시될 신고된 게시글의 전체 개수를 가져옵니다.
     * @return 신고된 게시글 총 개수
     */
    int getReportedLogCount();

    // 기존 메소드는 필요에 따라 유지하거나 삭제(페이징 없는 버전)
    List<LogPostDetailDto> getSimpleReportedLogList(); 
    
    /**
     * 게시글 신고 요청을 처리합니다.
     * @param reportDto 신고 정보 DTO (logNo, repoReason 포함)
     * @param reporterUserNo 신고자 회원 번호 (세션에서 가져옴)
     * @return 처리 성공 여부
     * @throws Exception 처리 중 예외 발생 시
     */
    boolean submitPostReport(ReportSubmissionDto reportDto, Integer reporterUserNo) throws Exception;
    
    /**
     * 특정 게시글에 대한 모든 신고 상세 내역을 가져옵니다.
     * @param logNo 조회할 게시글 번호
     * @return ReportItemDto 리스트
     */
    List<ReportItemDto> getReportItemsByLogNo(int logNo);
    
    /**
     * 관리자가 신고된 게시글을 삭제 처리합니다.
     * @param logNo 삭제할 게시글 번호
     * @return 처리 성공 여부
     * @throws Exception 처리 중 예외 발생 시
     */
    boolean deleteReportedLogByAdmin(int logNo) throws Exception;
    
    /**
     * 관리자가 신고된 게시글을 보류 처리합니다 (신고 수 리셋 및 관련 신고 건 처리됨 표시).
     * @param logNo 보류 처리할 게시글 번호
     * @return 처리 성공 여부
     * @throws Exception 처리 중 예외 발생 시
     */
    boolean dismissReportsForLogByAdmin(int logNo) throws Exception;
    
}