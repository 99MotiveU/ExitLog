package com.exitlog.login.controller;

import com.exitlog.login.service.EmailService;
import com.exitlog.login.service.LoginService;
import com.exitlog.login.model.entity.User;

import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException; 
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class FindpwController {
	
    private final LoginService loginService;
    private final EmailService emailService;

    public FindpwController(LoginService loginService, EmailService emailService) {
        this.loginService = loginService;
        this.emailService = emailService;
    }
	
    @PostMapping("/api/findpw/send-email-auth-code")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendFindIdEmailAuthCode(@RequestBody Map<String, String> payload, HttpSession session) {
        String userId = payload.get("userId");
        String email = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (userId == null || userId.isEmpty() || email == null || email.isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디와 이메일 주소를 모두 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        User user = loginService.findUserByUserIdAndEmail(userId, email); 

        if (user == null) {
            response.put("success", false);
            response.put("message", "입력하신 아이디와 이메일 정보가 일치하는 사용자가 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        try {
            // 비밀번호 찾기용 이메일 발송 메서드 호출 (EmailService에도 해당 메서드가 정의되어야 합니다.)
            String authCode = emailService.sendAuthCodeForFindPw(email); 
            session.setAttribute("findPwEmailAuthCode_" + email, authCode); // 세션 키를 비밀번호 찾기용으로 변경
            session.setMaxInactiveInterval(5 * 60); // 5분 유효

            response.put("success", true);
            response.put("message", "인증번호가 발송되었습니다.");
            return ResponseEntity.ok(response);
        } catch (MailException e) {
            e.printStackTrace(); 
            response.put("success", false);
            response.put("message", "메일 서버 오류: 인증번호 발송에 실패했습니다. 메일 설정을 확인해주세요.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) { 
            e.printStackTrace(); 
            response.put("success", false);
            response.put("message", "예상치 못한 오류: 인증번호 발송에 실패했습니다. 다시 시도해주세요.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/findpw/verify-email-auth-code")	
    @ResponseBody
    public ResponseEntity<Map<String, Object>> verifyFindIdEmailAuthCode(@RequestBody Map<String, String> payload, HttpSession session) {
        String email = payload.get("email");
        String enteredCode = payload.get("code");
        Map<String, Object> response = new HashMap<>();

        // 비밀번호 찾기용 세션 키 사용
        String storedCode = (String) session.getAttribute("findPwEmailAuthCode_" + email); 

        if (storedCode != null && storedCode.equals(enteredCode)) {
            session.removeAttribute("findPwEmailAuthCode_" + email);
            response.put("isVerified", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("isVerified", false);
            response.put("message", "인증번호가 일치하지 않거나 만료되었습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/findpw/change-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();

        String userId = payload.get("userId");
        String newPassword = payload.get("newPassword");

        if (userId == null || userId.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디와 새 비밀번호를 모두 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            boolean isChanged = loginService.updatePassword(userId, newPassword);
            if (isChanged) {
                response.put("success", true);
                response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "비밀번호 변경에 실패했습니다. 해당 아이디를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IllegalArgumentException e) { // LoginService에서 던진 커스텀 예외를 여기서 캐치
            if ("NEW_PASSWORD_IS_SAME_AS_OLD".equals(e.getMessage())) {
                response.put("success", false);
                response.put("message", "새 비밀번호는 기존 비밀번호와 동일할 수 없습니다.");
                return ResponseEntity.badRequest().body(response); // 400 Bad Request
            }
            // 그 외의 IllegalArgumentException (예: DUPLICATE_ID 등 다른 곳에서 던져진 경우)
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) { // 그 외의 예상치 못한 모든 예외 처리
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "서버 오류: 비밀번호 변경 중 문제가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
	@GetMapping("/findpw")
	public String showFidpw() {
		return "login/find_pw";
	}
}