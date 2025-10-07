package com.exitlog.login.controller;

import com.exitlog.login.service.EmailService;
import com.exitlog.login.service.LoginService;
import com.exitlog.login.model.entity.User;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class FindidController {

	private final LoginService loginService;
	private final EmailService emailService;

	public FindidController(LoginService loginService, EmailService emailService) {
		this.loginService = loginService;
		this.emailService = emailService;
	}

	@PostMapping("/api/findid/send-email-auth-code")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> sendFindIdEmailAuthCode(@RequestBody Map<String, String> payload,
			HttpSession session) {
		String email = payload.get("email");
		Map<String, Object> response = new HashMap<>();

		if (email == null || email.isEmpty()) {
			response.put("success", false);
			response.put("message", "이메일 주소를 입력해주세요.");
			return ResponseEntity.badRequest().body(response);
		}

		// 아이디 찾기 시: 이메일이 DB에 등록되어 있는지 확인 (없으면 오류)
		if (loginService.getUserByEmail(email) == null) {
			response.put("success", false);
			response.put("message", "등록되지 않은 이메일 주소입니다.");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // 404 Not Found
		}

		try {
			// 아이디 찾기용 이메일 발송 메서드 호출
			String authCode = emailService.sendAuthCodeForFindId(email); // 메서드명 변경 (EmailService도 변경 예정)
			session.setAttribute("findIdEmailAuthCode_" + email, authCode); // 세션 키 변경 (혼동 방지)
			session.setMaxInactiveInterval(5 * 60); // 5분 유효

			response.put("success", true);
			response.put("message", "인증번호가 발송되었습니다.");
			return ResponseEntity.ok(response);
		} catch (MailException e) { // 메일 발송 관련 구체적인 예외 처리
			e.printStackTrace(); // 개발 중에는 스택 트레이스 출력, 운영 환경에서는 로깅
			response.put("success", false);
			response.put("message", "메일 서버 오류: 인증번호 발송에 실패했습니다. 메일 설정을 확인해주세요.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		} catch (Exception e) { // 그 외의 예상치 못한 모든 예외 처리
			e.printStackTrace(); // 개발 중에는 스택 트레이스 출력, 운영 환경에서는 로깅
			response.put("success", false);
			response.put("message", "예상치 못한 오류: 인증번호 발송에 실패했습니다. 다시 시도해주세요.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/api/findid/verify-email-auth-code")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> verifyFindIdEmailAuthCode(@RequestBody Map<String, String> payload,
			HttpSession session) {
		String email = payload.get("email");
		String enteredCode = payload.get("code");
		Map<String, Object> response = new HashMap<>();

		String storedCode = (String) session.getAttribute("findIdEmailAuthCode_" + email);

		if (storedCode != null && storedCode.equals(enteredCode)) {
			session.removeAttribute("findIdEmailAuthCode_" + email); // 인증 성공 시 세션에서 코드 삭제
			response.put("isVerified", true);
			// 이메일 인증이 성공했음을 클라이언트에게 알리고, 아이디 조회는 별도의 요청으로 처리
			return ResponseEntity.ok(response);
		} else {
			response.put("isVerified", false);
			return ResponseEntity.badRequest().body(response); // 400 Bad Request
		}
	}

	@PostMapping("/api/findid/userid")
	@ResponseBody
	public ResponseEntity<Map<String, String>> findUserIdByEmail(@RequestBody Map<String, String> payload) {
		String email = payload.get("email");
		Map<String, String> response = new HashMap<>();

		if (email == null || email.isEmpty()) {
			response.put("message", "이메일 주소를 입력해주세요.");
			return ResponseEntity.badRequest().body(response);
		}

		// 이메일로 사용자 정보 조회
		User user = loginService.getUserByEmail(email);

		if (user != null) {
			response.put("userId", user.getUserId()); // 찾은 아이디를 반환
			return ResponseEntity.ok(response);
		} else {
			response.put("message", "해당 이메일로 등록된 아이디를 찾을 수 없습니다.");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
		}
	}


    @GetMapping("/findid")
    public String showFindId() {
        return "login/find_id";
    }
}

