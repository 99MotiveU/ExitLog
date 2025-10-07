package com.exitlog.login.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;

import com.exitlog.login.model.dto.SessionUserDto;
import com.exitlog.login.model.entity.User;
import com.exitlog.login.service.LoginService;
// LoginService 내부에 정의된 커스텀 예외 클래스들을 명시적으로 임포트
import com.exitlog.login.service.LoginService.UserNotFoundException;
import com.exitlog.login.service.LoginService.PasswordMismatchException;
import com.exitlog.login.service.LoginService.UserDeletedException;
import com.exitlog.login.service.LoginService.AlreadyLoggedInException; // 새로 추가된 예외 임포트

import com.exitlog.login.service.ActiveUserStore; // ActiveUserStore 임포트

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@SessionAttributes("loginUser")
@Controller
public class LoginController {

	private final LoginService loginService;
	private final ActiveUserStore activeUserStore; // ActiveUserStore 주입

	public LoginController(LoginService loginService, ActiveUserStore activeUserStore) {
		this.loginService = loginService;
		this.activeUserStore = activeUserStore; // ActiveUserStore 초기화
	}

	@GetMapping("/login")
	public String loginForm(@RequestParam(value = "error", required = false) String error, Model model, HttpSession session) {

		// 이미 로그인된 상태인지 확인 (세션에 loginUser가 있고, activeUserStore에도 있다면)
		if (model.containsAttribute("loginUser") && model.getAttribute("loginUser") != null) {
			SessionUserDto currentUser = (SessionUserDto) model.getAttribute("loginUser");
			// ActiveUserStore에 현재 세션 ID로 해당 사용자가 등록되어 있는지 재확인 (방어적 코드)
			if (activeUserStore.isUserLoggedIn(currentUser.getUserId()) &&
				session.getId().equals(activeUserStore.getSessionId(currentUser.getUserId()))) {
				System.out.println("[DEBUG] User " + currentUser.getUserId() + " already logged in. Redirecting to main.");
				return "redirect:/main";
			} else {
				// 세션은 남아있지만 ActiveUserStore에 없거나 다른 세션 ID라면 강제로 로그아웃 처리
				System.out.println("[DEBUG] Inconsistent login state for user " + currentUser.getUserId() + ". Invalidating session.");
				// 기존 세션 속성 제거
				model.asMap().remove("loginUser");
				// 세션 무효화
				session.invalidate();
				// 에러 메시지 설정
				model.addAttribute("errorMessage", "세션이 만료되었거나 다른 곳에서 로그인되었습니다. 다시 로그인해주세요.");
				return "login/login";
			}
		}

		if (error != null) {
			model.addAttribute("errorMessage", error); // 서비스에서 넘어온 에러 메시지를 직접 전달
		}
		return "login/login";
	}

	@PostMapping("/api/login")
	@ResponseBody // JSON 응답을 반환하도록 설정
	public Map<String, Object> loginApi(@RequestParam String userId, @RequestParam String password, HttpSession session,
			Model model) {
		Map<String, Object> response = new HashMap<>();

		try {
			User loggedInUser = loginService.login(userId, password); // 다중 로그인 체크 로직 포함

			// 로그인 성공 시 세션에 사용자 정보 저장
			int role = loginService.getRoleByUserNo(loggedInUser.getUserNo());
			SessionUserDto loginUser = new SessionUserDto(loggedInUser.getUserId(), loggedInUser.getUserNo(),
					loggedInUser.getNickname(), loggedInUser.getEmail(), role);

			// ***** 핵심: 로그인 성공 시 ActiveUserStore에 사용자 정보 추가 *****
			// 이전에 로그인된 세션이 있다면 무효화하거나, 새로 로그인된 세션만 허용하는 등의 정책을 여기서 구현 가능
			// }
			activeUserStore.addActiveUser(loggedInUser.getUserId(), session.getId());

			model.addAttribute("loginUser", loginUser); // @SessionAttributes에 의해 세션에 저장

			response.put("success", true);
			response.put("message", "로그인 성공!");
			response.put("redirectUrl", "/main"); // 메인 페이지로 리다이렉트 유도

		} catch (UserNotFoundException | PasswordMismatchException e) {
			// 아이디를 찾을 수 없거나 비밀번호가 일치하지 않는 경우
			response.put("success", false);
			response.put("message", e.getMessage()); // 서비스에서 던진 메시지("아이디 또는 비밀번호가 일치하지 않습니다.") 사용
		} catch (UserDeletedException e) {
			// 탈퇴한 회원인 경우
			response.put("success", false);
			response.put("message", e.getMessage());
		} catch (AlreadyLoggedInException e) { // ***** 핵심: 다중 로그인 예외 처리 *****
			response.put("success", false);
			response.put("message", e.getMessage()); // "이미 로그인된 사용자입니다..." 메시지
		} catch (Exception e) {
			// 그 외 예상치 못한 서버 내부 오류
			response.put("success", false);
			response.put("message", "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
			e.printStackTrace(); // 개발 중에는 스택 트레이스 출력 (운영 시에는 로그 파일로 남기기)
		}
		return response;
	}

//	로그아웃
	@GetMapping("/logout")
	public String logout(HttpSession session, SessionStatus status, HttpServletResponse response) {
		System.out.println("로그아웃");
		// 세션에서 로그인 사용자 정보 가져오기
		SessionUserDto loginUser = (SessionUserDto) session.getAttribute("loginUser");

		// ***** 핵심: 로그아웃 시 ActiveUserStore에서 사용자 정보 제거 *****
		if (loginUser != null) {
			activeUserStore.removeActiveUser(loginUser.getUserId());
		}

		status.setComplete(); // @SessionAttributes로 관리되는 세션 속성 제거
		session.invalidate(); // 세션 무효화
		// 캐시 제어 헤더 설정 (뒤로가기 시 로그인 페이지 캐시 방지)
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Expires", "0");
		return "redirect:/main";
	}
}