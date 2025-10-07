package com.exitlog.core.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.exitlog.login.model.dto.SessionUserDto;
import com.exitlog.login.service.LoginService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

//요청과 응답을 가로채는 객체 인터셉터
//-순서: 클라이언트-필터-디스패처서블렛-인터셉터-컨트롤러-....
@Slf4j
@Component
public class UserInterceptor implements HandlerInterceptor{
	@Autowired
	LoginService loginService;
	
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		log.info("==================== 🔥🔥START🔥🔥 ====================");
		String uri = request.getRequestURI();
		System.out.println("uri = " + uri);
		if(uri.startsWith("/mypage") || uri.startsWith("/log/write")) {
			SessionUserDto loginUser = (SessionUserDto) request.getSession().getAttribute("loginUser");
			//1.로그인 여부 확인
			if(loginUser == null) {
				response.sendRedirect("/login");
				return false;
			}
		}else if(uri.matches("^/log/\\d+/edit$")) {		
			String[] parts = uri.split("/");
			int logNo = Integer.parseInt(parts[2]);
			log.info("인터셉터 로그 번호 !!:{}",logNo);
			SessionUserDto loginUser = (SessionUserDto) request.getSession().getAttribute("loginUser");
			//1.로그인 여부 확인
			if(loginUser == null) {	
				response.sendRedirect("/login");
				return false;
			}
			//2.작성자 확인
			int userNo = loginService.getUserNoByLogNo(logNo);
			if(loginUser.getUserNo()!=userNo) {
				response.sendRedirect("/error/unAuthorized");
				return false;
			}
		}else if(uri.matches("^/admin.*")) {
			SessionUserDto loginUser = (SessionUserDto) request.getSession().getAttribute("loginUser");
			//로그인한 유저의 userNo 빼와서 ROLE=1인지 확인
			//1.로그인 여부 확인
			if(loginUser == null) {
				response.sendRedirect("/login");
				return false;
			}
			int role = loginService.getRoleByUserNo(loginUser.getUserNo());
			if(role!=1) {
				response.sendRedirect("/error/unAuthorized");
			}
		}
		return true;
	}
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {

	}
}
