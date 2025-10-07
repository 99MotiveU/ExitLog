package com.exitlog.log.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.exitlog.log.model.entity.Comment;
import com.exitlog.log.service.CommentService;
import com.exitlog.login.model.dto.SessionUserDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("log/comment")
@Controller
public class CommentController {
	@Autowired
	CommentService service;
	
	//댓글 요청
	@GetMapping("/{logNo}")
	@ResponseBody
	public List<Comment> getComments(@PathVariable int logNo){
		return service.getCommentsByLogNo(logNo);
	}
	
	//댓글 작성
	@PostMapping("/{logNo}")
	public ResponseEntity<?> addComment(@PathVariable int logNo, @RequestBody Comment comment, 
								@SessionAttribute("loginUser") SessionUserDto user){
		log.info("댓글 정보:{}"+comment);
		comment.setUserNo(user.getUserNo());
		comment.setLogNo(logNo);
		boolean resultComment = service.addCommentByLogNo(comment)>0;
		if(resultComment) {
			return ResponseEntity.ok("댓글 작성 성공");
		}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 등록 서버 오류");
		}
	}
	
	//댓글 수정
	@PostMapping("/edit/{logNo}")
	public ResponseEntity<?> editComment(@PathVariable int logNo, @RequestBody Comment comment){
		log.info("수정 댓글 정보"+comment);
		comment.setLogNo(logNo);
		boolean result = service.editCommentByCommentNo(comment)>0;
		if(result) {
			return ResponseEntity.ok("댓글 수정 성공");
		}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 수정 서버 오류");
		}
	}
	
	//댓글 삭제
	@PostMapping("/delete/{commentNo}")
	public ResponseEntity<?> deleteComment(@PathVariable int commentNo){
		log.info("삭제 댓글 번호:{}"+commentNo);
		boolean result = service.deleteCommentByCommentNo(commentNo)>0;
		if(result) {
			return ResponseEntity.ok("삭제 성공");
		}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 삭제 서버 오류");
		}
	}
	
	//대댓글 작성
	@PostMapping("/reply/{logNo}/{parentCommentNo}")
	@ResponseBody
	public ResponseEntity<?> addReply(@PathVariable int logNo, @PathVariable int parentCommentNo,
							@RequestBody Comment comment, @SessionAttribute("loginUser") SessionUserDto user){
	    comment.setUserNo(user.getUserNo());
	    comment.setLogNo(logNo);
	    comment.setParentCommentNo(parentCommentNo);
	    String parentNickname = service.addReply(comment);

	    Map<String, Object> response = new HashMap<>();
	    if(!parentNickname.equals("")) {
		    response.put("commentNo", comment.getCommentNo());
		    response.put("nickname", user.getNickname());
		    response.put("parentNickname", parentNickname);
		    response.put("content", comment.getContent());
		    return ResponseEntity.ok(response);
	    }
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("대댓글 작성 실패");
		
	}
}
