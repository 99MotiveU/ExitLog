package com.exitlog.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // 정렬 파라미터 처리를 위해 추가
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.exitlog.admin.model.dto.CertificationDto; // 재직 인증 DTO
import com.exitlog.admin.service.CertificationService; // 재직 인증 서비스
import com.exitlog.admin.service.ReportService;      // 기존 신고 서비스
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.pagination.LogPagination;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/admin")
public class AdminController {

    private final ReportService reportService;
    private final CertificationService certificationService;

    @Autowired
    public AdminController(ReportService reportService, CertificationService certificationService) {
        this.reportService = reportService;
        this.certificationService = certificationService; // 주입받은 서비스 할당
    }

    // ==== 신고 게시글 ====
    @GetMapping("/reports")
    public String reportManagementPage(Model model,
                                       @RequestParam(value = "page", defaultValue = "1") int currentPage,
                                       @RequestParam(value = "limit", defaultValue = "10") int limitPerPage,
                                       @RequestParam(value = "pageSize", defaultValue = "5") int uiPageSize) {
        
        log.info("요청: /admin/reports - page={}, limit={}, uiPageSize={}", currentPage, limitPerPage, uiPageSize);

        // 1. 전체 신고된 게시글 수 조회
        int totalReportedLogs = reportService.getReportedLogCount();
        log.info("전체 신고된 게시글 수: {}", totalReportedLogs);

        // 2. LogPagination 객체 생성
        LogPagination pagination = new LogPagination(currentPage, totalReportedLogs, limitPerPage, uiPageSize);
        log.info("생성된 Pagination 정보 (신고 게시글): {}", pagination);

        // 3. 페이지에 해당하는 신고된 게시글 목록 조회
        List<LogPostDetailDto> reportedLogsList = reportService.getPagedReportedLogList(pagination);
        if (reportedLogsList != null) {
            log.info("조회된 신고 게시글 목록 수: {}", reportedLogsList.size());
             if (!reportedLogsList.isEmpty()) {
                log.info("첫 번째 신고 게시글 번호: {}", reportedLogsList.get(0).getLogNo());
            }
        } else {
            log.info("조회된 신고 게시글 목록이 없습니다.");
        }
        
        model.addAttribute("pageTitle", "신고된 게시글 목록"); // (DB연동 테스트) 문구 제거 또는 수정
        model.addAttribute("reportedLogsList", reportedLogsList);
        model.addAttribute("pagination", pagination); // 페이지네이션 객체 추가
        model.addAttribute("currentUri", "/admin/reports");
        model.addAttribute("contentFragment", "admin/admin_content_reports"); 
        return "admin/admin_layout"; 
    }
    

    // ==== 재직 인증 ====
    @GetMapping("/certifications")
    public String employmentCertificateManagementPage(Model model,
                                                      @RequestParam(value = "page", defaultValue = "1") int currentPage,
                                                      @RequestParam(value = "limit", defaultValue = "10") int limitPerPage, // 한 페이지에 보여줄 아이템 수
                                                      @RequestParam(value = "pageSize", defaultValue = "5") int uiPageSize,   // UI에 표시할 페이지 번호 개수
                                                      @RequestParam(value = "sort", defaultValue = "certificateUploadDate,desc") String sort) {

        log.info("요청: /admin/certifications - page={}, limit={}, pageSize={}, sort={}", currentPage, limitPerPage, uiPageSize, sort);

        // 1. 전체 재직 인증 요청 수 조회 (페이지네이션 계산용)
        int totalCertifications = certificationService.getCertificationRequestCount();
        log.info("전체 재직 인증 요청 수: {}", totalCertifications);

        // 2. LogPagination 객체 생성 (기존 Log 게시판에서 사용하던 것 재활용)
        LogPagination pagination = new LogPagination(currentPage, totalCertifications, limitPerPage, uiPageSize);
        log.info("생성된 Pagination 정보: {}", pagination);


        // 3. 정렬 파라미터 파싱 (기존 로직 유지)
        String sortColumn = "certificateUploadDate"; 
        String sortDirection = "DESC";          
        if (sort != null && sort.contains(",")) {
            String[] sortParams = sort.split(",");
            sortColumn = sortParams[0];
            if (sortParams.length > 1 && (sortParams[1].equalsIgnoreCase("ASC") || sortParams[1].equalsIgnoreCase("DESC"))) {
                sortDirection = sortParams[1].toUpperCase();
            }
        } else if (sort != null && !sort.trim().isEmpty()){
            sortColumn = sort;
        }
        log.info("정렬 조건: column={}, direction={}", sortColumn, sortDirection);

        // 4. CertificationService 호출하여 정렬 및 페이지네이션된 재직 인증 목록 가져오기
        List<CertificationDto> certifications = certificationService.getAllCertificationRequests(pagination, sortColumn, sortDirection);
        if (certifications != null) {
            log.info("조회된 재직 인증 목록 수: {}", certifications.size());
        }


        // 5. 모델에 데이터 추가
        model.addAttribute("certifications", certifications);
        model.addAttribute("pagination", pagination); // 페이지네이션 객체 추가
        model.addAttribute("currentSort", sort);      // 현재 정렬 상태 유지를 위해 추가 (뷰에서 사용)
        model.addAttribute("currentUri", "/admin/certifications");
        model.addAttribute("contentFragment", "admin/admin_content_certifications");
        
        return "admin/admin_layout";
    }
    
    /**
     * 재직 인증 요청을 처리합니다 (승인 또는 반려).
     * @param certificateId 처리할 인증서의 IDs
     * @param newStatus 새로운 상태 ("APPROVED" 또는 "REJECTED")
     * @param redirectAttributes 리다이렉트 시 메시지 전달용
     * @return 재직 인증 목록 페이지로 리다이렉트
     */
    @PostMapping("/certifications/process")
    public String processCertificationAction(@RequestParam("certificationId") Integer certificateId,
                                           @RequestParam("newStatus") String newStatus,
                                           // 페이지네이션 및 정렬 상태 유지를 위한 파라미터 추가 (선택 사항)
                                           @RequestParam(value = "page", required = false) Integer page,
                                           @RequestParam(value = "limit", required = false) Integer limit,
                                           @RequestParam(value = "pageSize", required = false) Integer pageSize,
                                           @RequestParam(value = "sort", required = false) String sort,
                                           RedirectAttributes redirectAttributes) {
        
        log.info("인증 처리 요청: certificateId={}, newStatus={}", certificateId, newStatus);
        boolean success = certificationService.processCertification(certificateId, newStatus);

        if (success) {
            String messageAction = "APPROVED".equals(newStatus) ? "승인" : "반려";
            redirectAttributes.addFlashAttribute("successMessage", "인증 요청(ID: " + certificateId + ")이 성공적으로 " + messageAction + " 처리되었습니다.");
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "인증 요청(ID: " + certificateId + ") 처리 중 오류가 발생했습니다.");
        }

        // 리다이렉트 URL 구성 (페이지, 정렬 상태 유지)
        String redirectUrl = "redirect:/admin/certifications";
        StringBuilder params = new StringBuilder();
        if (page != null) params.append("page=").append(page).append("&");
        if (limit != null) params.append("limit=").append(limit).append("&");
        if (pageSize != null) params.append("pageSize=").append(pageSize).append("&");
        if (sort != null && !sort.isEmpty()) params.append("sort=").append(sort).append("&");

        if (params.length() > 0) {
            redirectUrl += "?" + params.substring(0, params.length() - 1); // 마지막 '&' 제거
        }
        log.info("인증 처리 후 리다이렉트 URL: {}", redirectUrl);
        return redirectUrl; 
    }
}