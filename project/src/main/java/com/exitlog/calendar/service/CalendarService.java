package com.exitlog.calendar.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.exitlog.calendar.mapper.JobPostMapper;
import com.exitlog.calendar.model.dto.JobPostDto;
import com.exitlog.calendar.model.entity.JobPost;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarService {
    private final RedisTemplate<String, String> redisTemplate;
    private final JobPostMapper jobPostMapper;
    private final ObjectMapper objectMapper;
    
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Value("${saramin.api.key}")
    private String key;
    
    /**
     * api 요청으로 받은 json 데이터를 entity와 매핑해서 redis에 저장한다.
     */
    @Scheduled(cron = "0 48 15  * * *", zone = "Asia/Seoul")
    public void updateDailyRecruitPosts() {
        List<JsonNode> allJobNodes = callSaraminApi(buildSearchOptionsForAll());
        List<JsonNode> todayJobNodes = callSaraminApi(buildSearchOptionsForToday());
        log.info("오늘 마감 raw data 받음: {}", todayJobNodes);

        List<JobPost> allEntity = new ArrayList<>();
        List<JobPost> todayEntity = new ArrayList<>();
        
        // 전체 공고 JsonNode → JobPost 변환
        for (JsonNode jobNode : allJobNodes) {
            try {
                JobPost job = objectMapper.treeToValue(jobNode, JobPost.class);
                allEntity.add(job);
            } catch (JsonProcessingException e) {
                log.error("전체 공고 변환 실패: {}", jobNode.toString(), e);
            }
        }

        // 오늘 마감 공고 JsonNode → JobPost 변환
        for (JsonNode jobNode : todayJobNodes) {
            try {
                JobPost job = objectMapper.treeToValue(jobNode, JobPost.class);
                todayEntity.add(job);
            } catch (JsonProcessingException e) {
                log.error("오늘 마감 공고 변환 실패: {}", jobNode.toString(), e);
            }
        }

        // DB 기존 공고 삭제
        jobPostMapper.deleteAllJobPosts();

        // DB에 저장
        for (JobPost entity : allEntity) {
            log.info("공고 DTO 정보: {}", entity);
            jobPostMapper.insertJobPost(entity);
        }

        // 유효기간 지난 공고 필터링
        List<JobPost> filteredEntity = allEntity.stream()
                .filter(entity -> isNotExpired(entity.getExpirationTimestamp()))
                .toList();

        // Redis 저장용 DTO 변환 및 저장
        List<JobPostDto> filteredDtoList = filteredEntity.stream()
                .map(JobPostDto::fromEntity)
                .toList();

        List<JobPostDto> todayDtoList = todayEntity.stream()
                .map(JobPostDto::fromEntity)
                .toList();
		try {
			String recruitmentsJson = objectMapper.writeValueAsString(filteredDtoList);
	        String todayRecruitmentsJson = objectMapper.writeValueAsString(todayDtoList);
	
	        redisTemplate.opsForValue().set("recruitments", recruitmentsJson);
	        redisTemplate.opsForValue().set("todayRecruitments", todayRecruitmentsJson);
	        																		
	        log.info("Redis에 전체 채용공고 저장 완료: key=recruitments, 공고 수={}개", filteredDtoList.size());
	        log.info("Redis에 오늘 마감 채용공고 저장 완료: key=todayRecruitments, 공고 수={}개", todayDtoList.size());
		} catch (JsonProcessingException e) {
			e.printStackTrace();
			log.error("Redis 저장용 JSON 변환 실패", e);
		}
    }

    private boolean isNotExpired(LocalDateTime expirationDate) {
        if (expirationDate == null) return false; // 마감일 없는 경우 제외
        return !expirationDate.toLocalDate().isBefore(LocalDate.now()); // 오늘 이전 마감일 제외
    }

    private List<JsonNode> callSaraminApi(String searchOption) {
        String apiUrlBase = "https://oapi.saramin.co.kr/job-search/?access-key=" + key + searchOption;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        List<JsonNode> allJobs = new ArrayList<>();

        try {
            int repeat = searchOption.contains("deadline=today") ? 1 : 2;

            for (int i = 0; i <repeat; i++) {
                ResponseEntity<String> response = restTemplate.exchange(apiUrlBase + i, HttpMethod.GET, entity, String.class);

                String body = response.getBody();
                log.info("받은 raw json: {}", body);

                JsonNode root = objectMapper.readTree(body);
                JsonNode jobNode = root.path("jobs").path("job");

                if (jobNode.isArray()) {
                    jobNode.forEach(node -> {
                        allJobs.add(node);
                    });
                } 
            }
            return allJobs;
        } catch (Exception e) {
            log.error("Saramin API 호출 중 오류 발생", e);
            return Collections.emptyList();
        }
    }

    private String buildSearchOptionsForAll() {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfThisMonth = now.withDayOfMonth(1);
        LocalDate endOfMonthAfterNext = firstDayOfThisMonth.plusMonths(2)
                .withDayOfMonth(firstDayOfThisMonth.plusMonths(2).lengthOfMonth());
        String deadlineStr = endOfMonthAfterNext.format(FORMATTER);

        return "&deadline=" + deadlineStr +
                "&count=110&loc_bcd=101000&job_type=1+4+11&job_mid_cd=2&job_cd=2232+84+86+87+89+91+118+101&sort=rc&start=";
    }

    private String buildSearchOptionsForToday() {
        return "&deadline=today&count=110&loc_bcd=101000&job_type=1+4+11&job_mid_cd=2&job_cd=2232+84+86+87+89+91+118+101&sort=rc&start=";
    }
}
