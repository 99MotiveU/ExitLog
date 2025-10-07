package com.exitlog.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.exitlog.admin.model.dto.ReportItemDto;
import com.exitlog.admin.model.entity.Report;
import com.exitlog.log.model.dto.LogPostDetailDto;

@Mapper
public interface ReportMapper {

	/**
     * 관리자 페이지 목록용으로 신고된 게시글의 기본 정보를 페이지네이션하여 조회합니다.
     * (Log의 repo_count > 0 이고 is_del = 0 인 것)
     * 작성자 닉네임 포함.
     * @param offset 레코드 시작 위치
     * @param limit 가져올 레코드 수
     * @return LogPost 리스트
     */
    List<LogPostDetailDto> selectPagedReportedLogs(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 관리자 페이지에 표시될 신고된 게시글의 전체 개수를 조회합니다.
     * (Log의 repo_count > 0 이고 is_del = 0 인 것)
     * @return 신고된 게시글 총 개수
     */
    int countReportedLogs();

    // 기존 selectBasicReportedLogs 메소드는 페이지네이션 없는 버전으로 남겨두거나,
    // selectPagedReportedLogs로 대체 후 삭제할 수 있습니다.
    // 우선은 그대로 두겠습니다.
    List<LogPostDetailDto> selectBasicReportedLogs();
    
    // --- 게시글 신고 저장을 위한 메소드 추가 ---
    /**
     * 새로운 신고 내역을 report 테이블에 삽입합니다.
     * @param report 저장할 Report 객체 (logNo, userNo, repoReason, repoDate 필요)
     * @return 삽입 성공 시 1 반환
     */
    int insertReport(Report report);

    /**
     * 특정 게시글(log)의 신고 횟수(REPO_COUNT)를 1 증가시킵니다.
     * @param logNo 신고 횟수를 증가시킬 게시글 번호
     * @return 업데이트 성공 시 1 반환
     */
    int incrementLogReportCount(@Param("logNo") int logNo);
    
    /**
     * 특정 게시글(logNo)에 대한 모든 신고 상세 내역을 조회합니다.
     * (신고자 닉네임 포함, 처리되지 않은 신고 우선 또는 모든 신고 등 조건 설정 가능)
     * @param logNo 조회할 게시글 번호
     * @return ReportItemDto 리스트
     */
    List<ReportItemDto> findReportItemsByLogNo(@Param("logNo") int logNo); 
    
    /**
     * 특정 게시글을 삭제 처리합니다 (IS_DEL 플래그를 1로 업데이트).
     * @param logNo 삭제 처리할 게시글 번호
     * @return 업데이트된 행의 수
     */
    int markLogAsDeleted(@Param("logNo") int logNo);
    
    /**
     * 특정 게시글(log)의 신고 횟수(REPO_COUNT)를 0으로 리셋합니다.
     * @param logNo 신고 횟수를 리셋할 게시글 번호
     * @return 업데이트된 행의 수
     */
    int resetLogReportCount(@Param("logNo") int logNo);
}