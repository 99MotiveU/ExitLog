package com.exitlog.calendar.model.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.exitlog.calendar.model.entity.JobPost;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JobPostDto implements Serializable{
	//프론트에 필요한 필드 채우기(api 출력 결과)
	
	private String id; //공고 번호
	private int active;//공고 진행 여부 1:진행중, 0:마감
	private String url; //공고 상세 페이지
	private String company; //기업명
	private String title; //공고 제목
	private LocalDateTime  openingDate; //접수 시작일
	private LocalDateTime  expirationDate; //접수 마감일
	private String location; //지역코드
	private String jobCode; //직무코드
	private String jobCodeName; //직무코드 이름
	private int experienceLevel; //경력 여부 1:신입, 2:경력, 3:신입/경력, 4:경력 무관
	private String experienceLevelName; //경력 상세
	
	public static JobPostDto fromEntity(JobPost jobPost) {
	    JobPostDto dto = new JobPostDto();
	    dto.setId(jobPost.getId());
	    dto.setTitle(jobPost.getTitle());
	    dto.setCompany(jobPost.getCompany());
	    dto.setLocation(jobPost.getLocation());
	    dto.setActive(jobPost.getActive());
	    dto.setOpeningDate(jobPost.getOpeningTimestamp());
	    dto.setExpirationDate(jobPost.getExpirationTimestamp());
	    dto.setExperienceLevel(jobPost.getExperienceLevel());
	    dto.setExperienceLevelName(jobPost.getExperienceLevelName());
	    dto.setJobCode(jobPost.getJobCode());
	    dto.setJobCodeName(jobPost.getJobCodeName());
	    dto.setUrl(jobPost.getUrl());
	    return dto;
	}
}