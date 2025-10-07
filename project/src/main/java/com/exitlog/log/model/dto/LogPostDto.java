package com.exitlog.log.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
public class LogPostDto { 
	private String title;
	private String content;
	private String valText; //회사 정보 
	private String companyName; //게시글에 입력한 회사명
	private boolean currentlyEmployed; //재직중 체크박스 여부
	private String userCompanyName; //작성자 회사명
	private List<Integer> tags; //태그 리스트
	    
}
