package com.exitlog.main;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.exitlog.calendar.mapper.JobPostMapper;
import com.exitlog.calendar.model.dto.JobPostDto;
import com.exitlog.log.model.dto.LogListItemDto;
import com.exitlog.log.service.LogService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/main")
@RequiredArgsConstructor
public class JobPostingController {
	private final RedisTemplate<String, String> redisTemplate;
	private final ObjectMapper objectMapper;
	private final JobPostMapper jobPostMapper;
    private final LogService logService;
    
    @Value("${saramin.api.key}")
    private String saraminApiKey;

	@GetMapping("")
	public String mainPage() {
		return "main";
	}
    @GetMapping("/api/deadline-today")
    private ResponseEntity<?> fetchSaraminApi() {    
    	try {    		
    		//redis에서 todayRecruitments로 불러오기
    		String rawJson = (String) redisTemplate.opsForValue().get("todayRecruitments");
    		if (rawJson == null) {
    			return ResponseEntity.ok(Collections.emptyList());
    		}
    		List<JobPostDto> result = objectMapper.readValue(rawJson, new TypeReference<List<JobPostDto>>() {});
    		return ResponseEntity.ok(result);
    	}catch (Exception e) {
	        e.printStackTrace();
	    }
		List<JobPostDto> dbResult = jobPostMapper.getTodayDeadline();
		return ResponseEntity.ok(dbResult);
    }
    @GetMapping("/api/popular")
    private ResponseEntity<?> getPopularLogs(){
    	List<LogListItemDto> list = logService.getPopularLogs();
    	return ResponseEntity.ok(list);
    }
}