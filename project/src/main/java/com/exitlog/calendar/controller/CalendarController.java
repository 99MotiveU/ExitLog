package com.exitlog.calendar.controller;

import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.exitlog.calendar.mapper.JobPostMapper;
import com.exitlog.calendar.model.dto.JobPostDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CalendarController {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final JobPostMapper jobPostMapper;
	@GetMapping("/calendar")
	public String showCalendar() {
		return "calendar/calendar";
	}
	
	@ResponseBody
	@GetMapping("/api/recruitments")
	public ResponseEntity<?> getRecruitments() throws JsonProcessingException {		 
	    try {
	    	   // Redis에서 원시 JSON 문자열로 꺼냄
	        String rawJson = (String) redisTemplate.opsForValue().get("recruitments");

	        if (rawJson == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No data found in Redis");
	        }
	        // JSON 문자열을 List<List<Object>>로 변환
	        List<JobPostDto> result = objectMapper.readValue(rawJson, new TypeReference<List<JobPostDto>>() {});

	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    List<JobPostDto> dbResult = jobPostMapper.selectAll();
	    return ResponseEntity.ok(dbResult);
	}


}
