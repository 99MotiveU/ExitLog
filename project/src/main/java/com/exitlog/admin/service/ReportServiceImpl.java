package com.exitlog.admin.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exitlog.admin.mapper.ReportMapper; // Mapper 임포트
import com.exitlog.admin.model.dto.ReportItemDto;
import com.exitlog.admin.model.dto.ReportSubmissionDto;
import com.exitlog.admin.model.entity.Report;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.pagination.LogPagination;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ReportServiceImpl implements ReportService {

    private final ReportMapper reportMapper;
 // private final LogMapper logMapper; // log 테이블 repo_count 직접 업데이트 시
    
    @Autowired
    public ReportServiceImpl(ReportMapper reportMapper) {
        this.reportMapper = reportMapper;
    }

    @Override
    public List<LogPostDetailDto> getPagedReportedLogList(LogPagination pagination) {
        int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
        int limit = pagination.getLimit();
        return reportMapper.selectPagedReportedLogs(offset, limit);
    }

    @Override
    public int getReportedLogCount() {
        return reportMapper.countReportedLogs();
    }

    // 기존 메소드 (페이지네이션 없는 버전)
    @Override
    public List<LogPostDetailDto> getSimpleReportedLogList() {
        return reportMapper.selectBasicReportedLogs();
    }
    
    // --- 게시글 신고 처리 메소드 구현 ---
    @Override
    @Transactional // 두 개 이상의 DB 업데이트가 있으므로 트랜잭션 처리
    public boolean submitPostReport(ReportSubmissionDto reportDto, Integer reporterUserNo) throws Exception {
        if (reporterUserNo == null) {
            throw new IllegalArgumentException("신고는 로그인한 사용자만 가능합니다.");
        }
        if (reportDto.getLogNo() == null || reportDto.getRepoReason() == null || reportDto.getRepoReason().trim().isEmpty()) {
            throw new IllegalArgumentException("신고 정보가 올바르지 않습니다. (게시글 번호 또는 사유 누락)");
        }

        // TODO: 동일 사용자가 동일 게시글에 대해 중복 신고 방지 로직 (선택 사항)
        // 예: reportMapper.checkIfAlreadyReported(reportDto.getLogNo(), reporterUserNo) > 0 이면 throw new Exception("이미 신고한 게시글입니다.");

        Report report = Report.builder()
                .logNo(reportDto.getLogNo())
                .userNo(reporterUserNo)
                .repoReason(reportDto.getRepoReason())
                .repoDate(LocalDateTime.now()) // 서버 시간 기준으로 신고일 설정
                .isDel(false) // 기본값
                // .repoCount(0) // Report 엔티티에 repoCount가 있다면 기본값 설정
                .build();

        int reportInserted = reportMapper.insertReport(report);
        if (reportInserted == 0) {
            throw new Exception("신고 내역 저장에 실패했습니다.");
        }

        // 해당 게시글의 신고 횟수(REPO_COUNT) 1 증가
        int logReportCountUpdated = reportMapper.incrementLogReportCount(reportDto.getLogNo());
        if (logReportCountUpdated == 0) {
            // 이 경우는 게시글이 없거나 할 때 발생 가능, 또는 REPO_COUNT 업데이트 실패.
            // 신고는 되었으나 카운트 업데이트가 안 된 상황에 대한 정책 필요.
            // 여기서는 일단 예외를 발생시켜 롤백하도록 함.
            throw new Exception("게시글 신고 횟수 업데이트에 실패했습니다.");
        }

        return true;
    }
    
    @Override
    public List<ReportItemDto> getReportItemsByLogNo(int logNo) {
        log.info("게시글 ID {}에 대한 신고 상세 내역 조회 서비스 호출", logNo);
        return reportMapper.findReportItemsByLogNo(logNo);
    }
    
    @Override
    @Transactional
    public boolean deleteReportedLogByAdmin(int logNo) throws Exception {
        log.info("관리자에 의한 게시글 ID {} 삭제 처리 서비스 호출", logNo);
        if (logNo <= 0) {
            throw new IllegalArgumentException("유효하지 않은 게시글 번호입니다.");
        }

        int updatedRows = reportMapper.markLogAsDeleted(logNo);
        if (updatedRows == 0) {
            // 해당 logNo의 게시글이 없거나 이미 삭제 처리된 경우, 또는 업데이트 실패
            log.warn("게시글 ID {} 삭제 처리 실패: 해당 게시글이 없거나 이미 처리되었을 수 있습니다.", logNo);
            // 상황에 따라 false를 반환하거나, 예외를 발생시킬 수 있습니다.
            // 여기서는 false를 반환하여 컨트롤러에서 적절히 처리하도록 합니다.
            return false; 
        }
        
        // TODO: 선택 사항 - 해당 게시글에 대한 모든 신고 내역(report 테이블)의 IS_DEL을 1로 변경하여 "처리됨"으로 표시할 수도 있습니다.
        // reportMapper.markReportsAsProcessedForLog(logNo);

        log.info("게시글 ID {} 삭제 처리 성공", logNo);
        return true;
    }
    
    @Override
    @Transactional
    public boolean dismissReportsForLogByAdmin(int logNo) throws Exception {
        log.info("관리자에 의한 게시글 ID {} 신고 보류(REPO_COUNT 리셋) 처리 서비스 호출", logNo);
        if (logNo <= 0) {
            throw new IllegalArgumentException("유효하지 않은 게시글 번호입니다.");
        }

        // log 테이블의 REPO_COUNT를 0으로 리셋
        int logResetCount = reportMapper.resetLogReportCount(logNo);
        
        if (logResetCount == 0) {
            // 해당 logNo의 게시글이 없거나, REPO_COUNT가 이미 0이었거나, 또는 업데이트에 실패한 경우.
            log.warn("게시글 ID {}의 신고 횟수 리셋 실패: 해당 게시글이 없거나 이미 처리되었을 수 있습니다.", logNo);
            return false; 
        }

        log.info("게시글 ID {} 신고 보류(REPO_COUNT 리셋) 처리 성공", logNo);
        return true;
    }
    
}