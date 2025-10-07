package com.exitlog.log.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exitlog.log.mapper.CommentMapper;
import com.exitlog.log.model.entity.Comment;
@Service
@Transactional
public class CommentService {
	@Autowired
	CommentMapper mapper;
	public List<Comment> getCommentsByLogNo(int logNo) {
		return mapper.getCommentList(logNo);
	}
	public int addCommentByLogNo(Comment comment) {
		return mapper.insertComment(comment);
	}
	public int editCommentByCommentNo(Comment comment) {
		return mapper.editComment(comment);
	}
	public int deleteCommentByCommentNo(int commentNo) {
		return mapper.deleteComment(commentNo);
	}
	public String addReply(Comment comment) {
		int result = mapper.insertReply(comment);
		return mapper.getParentNicknameByParentCommentNo(comment.getParentCommentNo());
	}

}
