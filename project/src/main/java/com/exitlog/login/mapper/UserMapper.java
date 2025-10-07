// com.exitlog.login.mapper.UserMapper.java
package com.exitlog.login.mapper;

import com.exitlog.login.model.entity.User; // User DTO 임포트
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper 
public interface UserMapper {
	
    User findByUserIdAndPassword(@Param("userId") String userId, @Param("password") String password);

    User findByUserId(String userId);

    User findByNickname(String nickname);
    
    User findByEmail(String email);
    
    void save(User user);

	int findBylogNo(int logNo);
    
    User MyPageInfo(int userNo, String userId, String password, String nickName,
    		String email, String companyName);

	void updatePassword(User user);

	User findByUserIdAndEmail(String userId, String email);

	int getRole(int userNo);
}