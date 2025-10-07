package com.exitlog.calendar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.exitlog.calendar.model.dto.JobPostDto;
import com.exitlog.calendar.model.entity.JobPost;

@Mapper
public interface JobPostMapper {
	//공고 저장 - 덮어쓰기 방식
	void insertJobPost(JobPost jobPost);
	
	//공고 조회 필터링
	List<JobPostDto> selectJobPostsByFilter(String jobCode, String experienceLevel);

	//전체 공고 조회
	List<JobPostDto> selectAll();

	void deleteAllJobPosts();

	List<JobPostDto> getTodayDeadline();
	
}
