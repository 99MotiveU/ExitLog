package com.exitlog.calendar.model.entity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
		
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class JobPost {

	//프론트에 필요한 필드 채우기(api 출력 결과)
	private String id; //공고 번호
	private int active;//공고 진행 여부 1:진행중, 0:마감
	private String url; //공고 상세 페이지
	private String company; //기업명
	private String title; //공고 제목
	private LocalDateTime  openingTimestamp; //접수 시작일
	private LocalDateTime  expirationTimestamp; //접수 마감일
	private String location; //지역코드
	private String jobCode; //직무코드
	private String jobCodeName; //직무코드 이름
	private int experienceLevel; //경력 여부 1:신입, 2:경력, 3:신입/경력, 4:경력 무관
	private String experienceLevelName; //경력 상세

	//json->dto로 매핑되기 위한 세팅: 요청 데이터 매핑, redis->dto 매핑
    @JsonSetter("company")
    public void setCompanyName(JsonNode company) {
        this.company = company.path("detail").path("name").asText();
    }
    
    @JsonSetter("opening-timestamp") 
    public void setOpeningDate(String timestampStr) {
        long epochSeconds = Long.parseLong(timestampStr);
        this.openingTimestamp = LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneId.systemDefault());
    }
    @JsonSetter("expiration-timestamp")
    public void setExpirationDate(String timestampStr) {
    	long epochSeconds = Long.parseLong(timestampStr);
    	this.expirationTimestamp = LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneId.systemDefault());
    }
 
    @JsonSetter("position")
    public void setPosition(JsonNode positionNode) {
        // position.location.name
        JsonNode locationNode = positionNode.path("location");
        this.location = locationNode.path("name").asText();
        
        // position.job-code.name
        JsonNode jobCodeNode = positionNode.path("job-code");
        this.jobCode = jobCodeNode.path("code").asText();
        this.jobCodeName = jobCodeNode.path("name").asText();
        
        JsonNode experienceNode = positionNode.path("experience-level");
        this.experienceLevel = experienceNode.path("code").asInt();
        this.experienceLevelName=experienceNode.path("name").asText();
        
        this.title=positionNode.path("title").asText();
    }

}
