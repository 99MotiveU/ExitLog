package com.exitlog.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.exitlog.admin.model.entity.EmploymentCertificate;
import com.exitlog.login.model.entity.User;

@Mapper
public interface MypageMapper {
	User MyPageInfo(@Param("user_no") Integer user_no);  

	int countNickname(@Param("nickname") String nickname);

	int updateUserPasswordInDB(@Param("userNo") Integer userNo, @Param("newPassword") String newPassword);

	int deleteUser(@Param("userNo") Integer userNo);

	int countEmailExcludingCurrentUser(@Param("email") String email, @Param("userNo") int userNo);

	int updateUserEmailInDB(@Param("userNo") int userNo, @Param("newEmail") String newEmail);

	int insertEmploymentCertificate(EmploymentCertificate certificate);

	int updateUserNickname(
	        @Param("userNo") Integer userNo,      // SQL에서 #{userNo}로 사용
	        @Param("nickname") String newNickname // SQL에서 #{nickname}으로 사용
	    ); 
	// 이메일 업데이트 메서드도 동일하게 확인하고 수정합니다.
    int updateUserEmail(
        @Param("userNo") Integer userNo,
        @Param("email") String newEmail
    );

    String selectLatestEmploymentStatusByUserNo(@Param("userNo") Integer userNo);

}