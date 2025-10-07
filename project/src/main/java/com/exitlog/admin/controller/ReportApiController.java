package com.exitlog.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.exitlog.admin.model.dto.ReportItemDto;
import com.exitlog.admin.model.dto.ReportSubmissionDto;
import com.exitlog.admin.service.ReportService;
import com.exitlog.login.model.dto.SessionUserDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller // 또는 @RestController (API만 제공한다면 @RestController가 더 적합)
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class ReportApiController {

    private final ReportService reportService;

    /**
     * 게시글 신고 접수 API
     * @param logNoFromPath 신고 대상 게시글 번호 (경로 변수)
     * @param reportDto 신고 내용 (JSON 요청 바디)
     * @param loginUser 현재 로그인한 사용자 정보 (세션에서 가져옴)
     * @return 처리 결과
     */
    @PostMapping("/api/log/{logNo}/report") // 전체 경로는 /api/log/{logNo}/report
    @ResponseBody // JSON 응답을 위해
    public ResponseEntity<?> submitReport(@PathVariable("logNo") Integer logNoFromPath,
                                          @RequestBody ReportSubmissionDto reportDto,
                                          @SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser) {
        
        if (loginUser == null) {
            log.warn("미로그인 사용자 신고 시도 (API): logNo={}", logNoFromPath);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인이 필요한 기능입니다."));
        }
        
        if (reportDto.getLogNo() == null || !reportDto.getLogNo().equals(logNoFromPath)) {
             log.warn("요청 바디의 logNo 불일치 또는 누락 (API). 경로 변수 logNo 사용: {}", logNoFromPath);
             reportDto.setLogNo(logNoFromPath); 
        }

        log.info("API 게시글 신고 접수 요청: logNo={}, DTO={}, 신고자 UserNo={}", logNoFromPath, reportDto, loginUser.getUserNo());

        try {
            boolean success = reportService.submitPostReport(reportDto, loginUser.getUserNo());
            if (success) {
                log.info("API 게시글 신고 성공: logNo={}", logNoFromPath);
                return ResponseEntity.ok(Map.of("message", "신고되었습니다."));
            } else {
                log.error("API 게시글 신고 처리 중 서비스에서 false 반환: logNo={}", logNoFromPath);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "신고 처리 중 알 수 없는 오류가 발생했습니다."));
            }
        } catch (IllegalArgumentException e) {
            log.warn("API 신고 처리 중 유효성 검사 실패: {} (logNo={})", e.getMessage(), logNoFromPath);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("API 신고 처리 중 서버 오류 발생: logNo=" + logNoFromPath, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "신고 처리 중 서버 오류가 발생했습니다. 관리자에게 문의해주세요."));
        }
    }
    
    /**
     * 특정 게시글에 대한 신고 상세 내역 조회
     * @param logNo 조회할 게시글 번호
     * @return 신고 상세 내역 리스트 또는 에러 응답
     */
    @GetMapping("/api/reports/log/{logNo}/details") // API 경로 예시
    @ResponseBody
    public ResponseEntity<?> getReportDetailsForAdmin(@PathVariable("logNo") int logNo) {
        log.info("API 요청: 관리자용 - 게시글 ID {}의 신고 상세 내역 조회", logNo);
        try {
            List<ReportItemDto> reportItems = reportService.getReportItemsByLogNo(logNo);
            // 신고 내역이 없을 수도 있으므로, 빈 리스트는 정상 응답으로 처리
            return ResponseEntity.ok(reportItems);
        } catch (Exception e) {
            log.error("API: 관리자용 - 게시글 ID {} 신고 상세 내역 조회 중 오류 발생", logNo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "신고 내역 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 관리자가 신고된 게시글 삭제 처리
     * @param logNo 삭제할 게시글 번호
     * @param loginUser 현재 로그인한 관리자 정보 (권한 확인용)
     * @return 처리 결과
     */
    @PostMapping("/api/admin/reports/log/{logNo}/delete") // ⭐ 관리자용 삭제 API 경로
    @ResponseBody
    public ResponseEntity<?> deleteReportedLogByAdmin(@PathVariable("logNo") int logNo,
                                                    @SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser) {
        
        // 관리자 권한 확인 (필수)
        if (loginUser == null /* || !isAdmin(loginUser) */) { // 실제 관리자 확인 로직 필요
            log.warn("권한 없는 사용자의 게시글 삭제 시도: logNo={}, 요청자: {}", logNo, (loginUser != null ? loginUser.getUserId() : "게스트"));
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "게시글 삭제 권한이 없습니다."));
        }
        
        log.info("API 요청: 관리자 - 게시글 ID {} 삭제 처리 (요청자: {})", logNo, loginUser.getUserId());

        try {
            boolean success = reportService.deleteReportedLogByAdmin(logNo);
            if (success) {
                log.info("API: 게시글 ID {} 삭제 처리 성공", logNo);
                return ResponseEntity.ok(Map.of("message", "게시글이 성공적으로 삭제 처리되었습니다."));
            } else {
                log.warn("API: 게시글 ID {} 삭제 처리 실패 (서비스에서 false 반환)", logNo);
                return ResponseEntity.status(HttpStatus.NOT_FOUND) // 또는 다른 적절한 상태 코드
                                     .body(Map.of("message", "게시글을 찾을 수 없거나 이미 처리되었을 수 있습니다."));
            }
        } catch (IllegalArgumentException e) {
            log.warn("API: 게시글 삭제 처리 중 유효성 검사 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("API: 게시글 ID {} 삭제 처리 중 서버 오류 발생", logNo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "게시글 삭제 처리 중 서버 오류가 발생했습니다."));
        }
    }
    
    /**
     * 관리자가 신고된 게시글 보류 처리 (신고 수 리셋)
     * @param logNo 보류 처리할 게시글 번호
     * @param loginUser 현재 로그인한 관리자 정보 (권한 확인용)
     * @return 처리 결과
     */
    @PostMapping("/api/admin/reports/log/{logNo}/dismiss") // ⭐ 관리자용 보류 API 경로
    @ResponseBody
    public ResponseEntity<?> dismissReportsForLogByAdmin(@PathVariable("logNo") int logNo,
                                                       @SessionAttribute(name = "loginUser", required = false) SessionUserDto loginUser) {
        
        // 관리자 권한 확인 (필수) - 실제 로직으로 구현해야 합니다.
        if (loginUser == null /* || !"ADMIN".equals(loginUser.getRole()) */) { 
            log.warn("권한 없는 사용자의 신고 보류 시도: logNo={}, 요청자: {}", logNo, (loginUser != null ? loginUser.getUserId() : "게스트"));
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "해당 작업을 수행할 권한이 없습니다."));
        }
        
        log.info("API 요청: 관리자 - 게시글 ID {} 신고 보류(리셋) 처리 (요청자: {})", logNo, loginUser.getUserId());

        try {
            boolean success = reportService.dismissReportsForLogByAdmin(logNo);
            if (success) {
                log.info("API: 게시글 ID {} 신고 보류(리셋) 처리 성공", logNo);
                return ResponseEntity.ok(Map.of("message", "게시글 신고가 보류 처리되고 신고 수가 리셋되었습니다."));
            } else {
                log.warn("API: 게시글 ID {} 신고 보류(리셋) 처리 실패 (서비스에서 false 반환)", logNo);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body(Map.of("message", "게시글을 찾을 수 없거나 처리 중 문제가 발생했습니다."));
            }
        } catch (IllegalArgumentException e) {
            log.warn("API: 신고 보류(리셋) 처리 중 유효성 검사 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("API: 게시글 ID {} 신고 보류(리셋) 처리 중 서버 오류 발생", logNo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "신고 보류(리셋) 처리 중 서버 오류가 발생했습니다."));
        }
    }
    
}
