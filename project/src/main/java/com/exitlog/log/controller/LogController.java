package com.exitlog.log.controller;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.multipart.MultipartFile;

import com.exitlog.log.model.dto.LogListItemDto;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.log.model.dto.LogPostDto;
import com.exitlog.log.service.LogService;
import com.exitlog.login.model.dto.SessionUserDto;
import com.exitlog.pagination.LogPagination;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
@RequestMapping("/log")
public class LogController {

//	  생성자 주입, 필드 주입 방식이 혼재되어있음. 논의 필요.
//    private final CommentService commentService;

	@Autowired
	LogService service;
	

//    LogController(CommentService commentService) {
//        this.commentService = commentService;
//    } // 컨트롤러에서도 기본값 정의


	
    /**
     * 게시글 목록 페이지 (페이징 및 검색 기능 적용)
     */
    @GetMapping("")
    public String showLogListPage(Model model,
                                  @RequestParam(value = "page", defaultValue = "1") int currentPage,
                                  @RequestParam(value = "limit", defaultValue = "10") int limitPerPage,
                                  @RequestParam(value = "pageSize", defaultValue = "5") int pageSize,
                                  @RequestParam(value = "searchType", required = false) String searchType, 
                                  @RequestParam(value = "keyword", required = false) String keyword) {
        
    	log.info("요청 파라미터: currentPage={}, limitPerPage={}, pageSize={}, searchType={}, keyword={}", 
                currentPage, limitPerPage, pageSize, searchType, keyword);
    	
        // 1. 검색 조건에 맞는 전체 게시글 수 조회
        int listCount = service.getLogListCount(searchType, keyword);
        log.info("조건에 맞는 전체 아이템 수 (listCount): {}", listCount);

        // 2. LogPagination 객체 생성
        LogPagination pagination = new LogPagination(currentPage, listCount, limitPerPage, pageSize);
        log.info("Pagination 객체 정보: {}", pagination.toString());
        
        // 3. 페이지에 해당하는 게시글 목록 조회 (검색 조건 포함)
        List<LogListItemDto> logListItems = service.getPagedLogItemsForList(pagination, searchType, keyword);
        
        if (logListItems != null) {
            log.info("조회된 아이템 수: {}", logListItems.size());
            if (!logListItems.isEmpty()) {
                log.info("첫 번째 아이템 LogNo: {}", logListItems.get(0).getLogNo());
            }
        } else {
            log.info("조회된 아이템이 없습니다 (logListItems is null).");
        }
        
        model.addAttribute("logListItems", logListItems);
        model.addAttribute("pagination", pagination);
        
        // 검색 파라미터를 모델에 추가 (뷰에서 검색창 및 페이지네이션 링크에 사용)
        if (searchType != null) model.addAttribute("searchType", searchType);
        if (keyword != null) model.addAttribute("keyword", keyword);
        
        return "log/log_list";
    }
	
	// 게시글 전체 조회 기능
	/*
	 * @GetMapping("") public String getAllLogs(Model model) { List<LogPost> loglist
	 * = service.getAllLogs(); model.addAttribute("logList", loglist); return
	 * "log/log_list"; }
	 */
	
	/** 게시글 생성 페이지 진입
	 * @return
	 */
	@GetMapping("/add")
	public String LogWrite(Model model) {
	    model.addAttribute("log", null);
	    model.addAttribute("actionUrl", "/log/add"); 
	    model.addAttribute("buttonText", "등록하기");
		return "log/log_write";
	}
	

	/** 웹 에디터 사진 등록
	 * @param image
	 * @return
	 */
	@PostMapping("/imgUpload")
	@ResponseBody
	public Map<String,Object> uploadImage(MultipartFile image, @SessionAttribute("loginUser") SessionUserDto user){
		if(image.isEmpty()) return null;
		String imageUrl = "/upload/post/"+service.saveImage(image,user.getUserNo());
		return Map.of("result",true, "url",imageUrl);
	}

	/** 게시글(Log) 생성
	 * @param log
	 * @param ra
	 * @return
	 */
	@PostMapping("/add")
	public ResponseEntity<?> addLog (@RequestBody LogPostDto dto, 
									@SessionAttribute("loginUser") SessionUserDto user) {
		log.info("재직여부 체크박스 값 :{}",dto.isCurrentlyEmployed());
		LogPostDetailDto logPost = LogPostDetailDto.builder()
				.title(dto.getTitle())
				.content(dto.getContent())
				.valText(dto.getValText())
				.companyName(dto.getCompanyName())
				.currentlyEmployed(dto.isCurrentlyEmployed())
				.userNo(user.getUserNo())
				.build();
		int logNo = service.putLog(logPost,dto.getTags(),user.getUserNo()); //logNo
		if(logNo>0) {
			return ResponseEntity.ok(Map.of("logNo",logNo));
		}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "등록 서버 오류"));
		}

	}
	
	/** 게시글(Log) 진입
	 * @param logNo
	 * @param model
	 * @return
	 */
	@GetMapping("/{logNo}")
	public String getLog(@PathVariable int logNo,Model model, HttpSession session) {
		LogPostDetailDto logBean = service.getLogByLogNo(logNo, session);
		if(logBean==null) {
			return "error/404notFound";
		}else {
			model.addAttribute("bean", logBean);
			log.info(logBean.toString());
			return "log/log_detail";
		}
	}

	
	/** 게시글(Log) 삭제
	 * @param logNo
	 * @param model
	 */
	@DeleteMapping("/{logNo}")
	@ResponseBody
	public ResponseEntity<String> delLog(@PathVariable int logNo) {
	    int result = service.delLogByLogNo(logNo);
	    if (result == 0) {
	        return ResponseEntity
	                .status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("게시글 삭제에 실패하였습니다.");
	    } else {
	        return ResponseEntity
	                .ok("게시글이 삭제되었습니다.");
	    }
	}

	
	/** 게시글(Log) 수정 진입
	 * @return
	 */
	@GetMapping("/{logNo}/edit")
	public String editLog(@PathVariable int logNo, Model model) {
	    LogPostDto log = service.getEditLog(logNo);
	    model.addAttribute("log", log);
	    model.addAttribute("actionUrl", "/log/" + logNo+"/edit");
	    model.addAttribute("buttonText", "수정하기");
	    if(log==null) return "error/404notFound";
	    return "log/log_edit"; // Thymeleaf fragment 사용 예시
	}

	
	/** 게시글(Log) 수정 요청
	 * @param log
	 * @return
	 */
	@PostMapping("/{logNo}/edit")
	@ResponseBody
	public ResponseEntity<?> editLog(@PathVariable int logNo ,@RequestBody LogPostDto dto, 
											@SessionAttribute("loginUser") SessionUserDto user ) {
		log.info("게시글 수정 요청",dto.toString());
		LogPostDetailDto logPost = LogPostDetailDto.builder()
				.logNo(logNo)
				.title(dto.getTitle())
				.content(dto.getContent())
				.valText(dto.getValText())
				.companyName(dto.getCompanyName())
				.currentlyEmployed(dto.isCurrentlyEmployed())
				.userNo(user.getUserNo())
				.build();
		int result = service.editLog(logPost,dto.getTags());
		if(result>0) {
			return ResponseEntity.ok(Map.of("logNo",logNo));			
		}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "수정 서버 오류"));
		}
	}
	
	

}

