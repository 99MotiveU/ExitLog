package com.exitlog.log.model.entity;

import java.sql.Date;
import lombok.Data;

@Data
public class Comment {
	private int commentNo;
	private int userNo;
	private int logNo;
	private String nickname;
	private String content;
	private int isDel;
	private int parentCommentNo;
	private String parentNickname;
	private Date createdDate;
}
