package com.exitlog.log.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.exitlog.log.model.entity.Comment;

@Mapper
public interface CommentMapper {
	
	List<Comment> getCommentList(int logNo);
	
	int insertComment(Comment comment);

	int editComment(Comment comment);

	int deleteComment(int commentNo);

	int insertReply(Comment comment);

	String getParentNicknameByParentCommentNo(int parentCommentNo);

}
