package com.exitlog.login.model.entity;

import java.sql.Date;

import lombok.Data;

@Data
public class User {
	private int userNo;
	private String userId;
	private String password;
	private String nickname;
	private String email;
	private Date createdDate;
	private Boolean isDel;
	private int role;
	private String companyName;


}
