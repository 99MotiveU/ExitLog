package com.exitlog.login.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionUserDto {
	private String userId;
	private int userNo;
	private String nickname;
	private String email;
	private int isAdmin;
}

	
