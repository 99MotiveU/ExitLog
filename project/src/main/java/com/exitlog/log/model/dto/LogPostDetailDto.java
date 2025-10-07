package com.exitlog.log.model.dto;

import java.sql.Date;
import java.util.List;

import com.exitlog.log.model.entity.Tag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogPostDetailDto { 
	private int logNo;
	private int userNo;
	private String nickname;
	private String title;
	private String content;
	private String valText; //회사 정보 
	private int viewCount;
	private int isDel;
	private int repoCount;
	private Date createdDate;
	private Date editedDate;
	private String companyName; //게시글에 입력한 회사명
	private boolean currentlyEmployed; //재직중 체크박스 여부
	
	private String userCompanyName; //작성자 회사명    
	private List<Tag> tags;
}
