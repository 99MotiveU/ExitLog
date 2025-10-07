package com.exitlog.log.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.exitlog.log.mapper.LogMapper;
import com.exitlog.log.model.dto.LogListItemDto;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.log.model.dto.LogPostDto;
import com.exitlog.pagination.LogPagination;

import jakarta.servlet.http.HttpSession;


@Service
public class LogService {
	@Autowired
	LogMapper mapper;
	private final Path uploadDir=Paths.get(System.getProperty("user.dir")).getParent().resolve("imgUpload").resolve("postImages");
	
	public List<LogPostDetailDto> getAllLogs() {
		List<LogPostDetailDto> logList = mapper.selectAllLogs();
		return logList;
	}

	
	@Transactional
	public LogPostDetailDto getLogByLogNo(int logNo, HttpSession session) {
		String key = "logView_"+logNo;
		if(session.getAttribute(key)==null) {
			mapper.incrementViewCount(logNo);
			session.setAttribute(key, true);

		}	
	  return mapper.selectLog(logNo);
  }

  
	@Transactional
	public int delLogByLogNo(int logNo) {
		mapper.deleteComments(logNo);
		return mapper.deleteLog(logNo);
	}

	/** 이미지 생성 시 에디터 업로드를 위한 로컬 파일 등록
	 * @param image
	 * @return
	 */
	public String saveImage(MultipartFile image,int userNo) {
		//파일 등록 위치 생성
		try {
			if(!Files.exists(uploadDir)) {
				Files.createDirectories(uploadDir);
			}
		} catch (Exception e) {
			throw new RuntimeException("업로드 디렉토리 생성 실패");
		}
		
		//파일명
		String orgFileName = image.getOriginalFilename(); //파일명
		String uuid = UUID.randomUUID().toString().replaceAll("-", "");
		String extension = orgFileName.substring(orgFileName.lastIndexOf(".")+1); //확장자  현대해상.jpg
		String saveFilename = userNo + "_" + uuid + "." + extension;
		try {
			File uploadFile = new File(uploadDir.toFile(), saveFilename);
			image.transferTo(uploadFile);
			return saveFilename;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	/** 게시글(Log) 등록
	 * @param log
	 * @param tags
	 * @return
	 */
	@Transactional
	public int putLog(LogPostDetailDto logEntity, List<Integer> tags, int userNo) {
	    String baseUrl = "https://localhost:8080";  // 실제 서비스 도메인으로 바꿔주세요

	    // 1. content 내 상대경로 → 절대경로 변환
	    String contentWithAbsUrls = convertRelativeToAbsolute(logEntity.getContent(), baseUrl);

	    // 2. Safelist 설정
	    Safelist safelist = new Safelist()
	        .addTags("p", "br", "b", "i", "u", "strong", "em", "table", "tr", "td", "th", "tbody", "thead", "tfoot", "img", "ul", "ol", "li", "a")
	        .addAttributes("img", "src", "alt", "title", "contenteditable")
	        .addAttributes("a", "href", "title")
	        .addAttributes("table", "border", "cellpadding", "cellspacing")
	        .addProtocols("a", "href", "http", "https", "mailto")
	        .addProtocols("img", "src", "http", "https")
	        .preserveRelativeLinks(false);  // 절대경로 쓸 거니까 false

	    // 3. Jsoup 클린 수행
	    String cleanContent = Jsoup.clean(contentWithAbsUrls, safelist);

	    // 4. 절대경로 → 다시 상대경로로 변환
	    cleanContent = convertAbsoluteToRelative(cleanContent, baseUrl);

	    logEntity.setContent(cleanContent);

	    // 5. 이미지 파일 존재하지 않는 것 삭제 등 -> 파일 이름에 logNo 넣어서 이미지 저장 로직 추가 필요
//	    List<String> imageFileNames = extractFilenames(cleanContent);
//	    File uploadFolder = uploadDir.toFile();
//	    File[] uploadFiles = uploadFolder.listFiles();
//	    if (uploadFiles != null) {
//	        for (File file : uploadFiles) {
//	            if (file.getName().startsWith(userNo + "_") && !imageFileNames.contains(file.getName())) {
//	                file.delete();
//	            }
//	        }
//	    }

	    int result = mapper.insertLog(logEntity);
	    int logNo = logEntity.getLogNo();

	    for (Integer tagNo : tags) {
	        mapper.insertPostTag(logNo, tagNo);
	    }
	    return logNo;
	}

	// 상대경로 → 절대경로 변환
	private String convertRelativeToAbsolute(String html, String baseUrl) {
	    return html.replaceAll("src=\"/upload/", "src=\"" + baseUrl + "/upload/");
	}

	// 절대경로 → 상대경로 변환
	private String convertAbsoluteToRelative(String html, String baseUrl) {
	    return html.replaceAll("src=\"" + baseUrl + "/upload/", "src=\"/upload/");
	}



	public LogPostDto getEditLog(int logNo) {
		return mapper.getEditLog(logNo);
	}
	
	public int editLog(LogPostDetailDto logEntity, List<Integer> tags) {
		//기존 태그 삭제
		mapper.deleteTag(logEntity.getLogNo());
		//다시 태그 등록
	    for (Integer tagNo : tags) {
	        mapper.insertPostTag(logEntity.getLogNo(), tagNo);
	    }
		
		return mapper.editLog(logEntity);
	}
	
	public int getLogMyListCount(Integer userNo) {
        return mapper.getLogMyListCount(userNo);
    }
	
	public List<LogPostDetailDto> getLogList(LogPagination pagination) {
        int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
        int limit = pagination.getLimit();
        return mapper.selectPagedLogs(offset, limit);
    }
	
	public List<LogPostDetailDto> getMyLogList(Integer userNo,LogPagination pagination) {
        int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
        int limit = pagination.getLimit();
        
        return mapper.selectMyPagedLogs(userNo,offset, limit);
    }
	

	/** html 형태의 content 중 img에서 경로만 추출하기
	 * @param content
	 * @return
	 */
	private List<String> extractFilenames(String content) {
		List<String> filenames = new ArrayList<>();
		Document doc = Jsoup.parse(content);
		Elements images = doc.select("img");
		
		for (Element img : images) {
			String src = img.attr("src");
			if (src != null && src.contains("/upload/")) {
				String filename = Paths.get(src).getFileName().toString();
				filenames.add(filename);
			}
		}
		return filenames;
	}
	
	// --- LogListItemDto를 위한 새로운 서비스 메소드 ---
	/**
     * 모든 (삭제되지 않은) 게시글 목록을 LogListItemDto 형태로 가져옵니다. (페이지네이션/검색 없음)
     * @return LogListItemDto 리스트
     */
    public List<LogListItemDto> getAllLogItemsForList() {
        return mapper.findAllLogItemsForList();
    }
    
    /**
     * (수정) 검색 조건 및 페이지네이션에 맞는 게시글 목록의 전체 개수를 반환합니다.
     * @param searchType 검색 타입
     * @param keyword 검색어
     * @return 조건에 맞는 게시글 총 개수
     */
	public int getLogListCount(String searchType, String keyword) {
        // keyword가 비어있거나 null이면 searchType도 무시 (또는 기본 검색 타입으로 처리)
        // Mapper에서는 keyword가 ""일 때도 null과 동일하게 처리 (if test="keyword != null and keyword != ''")
        String validatedKeyword = StringUtils.hasText(keyword) ? keyword : null;
        String validatedSearchType = StringUtils.hasText(keyword) && StringUtils.hasText(searchType) ? searchType : null;

        return mapper.getLogListCount(validatedSearchType, validatedKeyword);
    }
	
	/**
     * (수정) 페이지네이션 및 검색 조건에 맞는 (삭제되지 않은) 게시글 목록을 LogListItemDto 형태로 가져옵니다.
     * @param pagination 페이지네이션 정보 객체
     * @param searchType 검색 타입
     * @param keyword 검색어
     * @return LogListItemDto 리스트
     */
    public List<LogListItemDto> getPagedLogItemsForList(LogPagination pagination, String searchType, String keyword) {
        int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
        int limit = pagination.getLimit();

        String validatedKeyword = StringUtils.hasText(keyword) ? keyword : null;
        String validatedSearchType = StringUtils.hasText(keyword) && StringUtils.hasText(searchType) ? searchType : null;
        
        return mapper.findPagedLogItemsForList(offset, limit, validatedSearchType, validatedKeyword);
    }


	public List<LogListItemDto> getPopularLogs() {
		return mapper.getPopularLogs();
	}
    

}
