package com.exitlog.login.controller;

import com.exitlog.login.model.entity.User;
import com.exitlog.login.service.LoginService;
import com.exitlog.login.service.EmailService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@Controller
public class SignupController {

    private final LoginService loginService;
    private final EmailService emailService;

    public SignupController(LoginService loginService, EmailService emailService) {
        this.loginService = loginService;
        this.emailService = emailService;
    }

    @GetMapping("/signup")
    public String signupForm(Model model) {
        if (model.getAttribute("loggedInUser") != null) { return "redirect:/"; }
        return "login/signup";
    }

    @PostMapping("/api/check-username")
    @ResponseBody
    public Map<String, Boolean> checkUsername(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        boolean isDuplicate = loginService.getUserByUserId(userId) != null;
        Map<String, Boolean> response = new HashMap<>();
        response.put("isDuplicate", isDuplicate);
        return response;
    }

    @PostMapping("/api/check-nickname")
    @ResponseBody
    public Map<String, Boolean> checkNickname(@RequestBody Map<String, String> payload) {
        String nickname = payload.get("nickname");
        boolean isDuplicate = loginService.getUserByNickname(nickname) != null;
        Map<String, Boolean> response = new HashMap<>();
        response.put("isDuplicate", isDuplicate);
        return response;
    }

    @PostMapping("/api/signup/send-email-auth-code")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendSignupEmailAuthCode(@RequestBody Map<String, String> payload, HttpSession session) {
        String email = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.isEmpty()) {
            response.put("success", false);
            response.put("message", "이메일 주소를 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        // 회원가입 시: 이미 가입된 이메일 주소인지 확인
        if (loginService.getUserByEmail(email) != null) { // 이메일이 DB에 이미 존재한다면
            response.put("success", false);
            response.put("message", "이미 가입된 이메일 주소입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response); // 409 Conflict
        }

        try {
            // 회원가입용 이메일 발송 메서드 호출
            String authCode = emailService.sendAuthCodeForSignup(email); // 메서드명 변경 (EmailService도 변경 예정)
            session.setAttribute("signupEmailAuthCode_" + email, authCode); // 세션 키 변경 (혼동 방지)
            session.setMaxInactiveInterval(5 * 60); // 5분 유효

            response.put("success", true);
            response.put("message", "인증번호가 발송되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // 실제 운영 환경에서는 log.error(...) 사용 권장
            response.put("success", false);
            response.put("message", "인증번호 발송에 실패했습니다. 다시 시도해주세요.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/api/signup/verify-email-auth-code") // 엔드포인트 경로 변경
    @ResponseBody
    public Map<String, Boolean> verifySignupEmailAuthCode(@RequestBody Map<String, String> payload, HttpSession session) {
        String email = payload.get("email");
        String enteredCode = payload.get("code");
        Map<String, Boolean> response = new HashMap<>();

        // 변경된 세션 키 사용
        String storedCode = (String) session.getAttribute("signupEmailAuthCode_" + email);

        if (storedCode != null && storedCode.equals(enteredCode)) {
            session.removeAttribute("signupEmailAuthCode_" + email); // 인증 성공 시 세션에서 코드 삭제
            response.put("isVerified", true);
        } else {
            response.put("isVerified", false);
        }
        return response;
    }

     @PostMapping("/api/signup")
     @ResponseBody
     public ResponseEntity<Map<String, Object>> signup(@RequestBody User user) {
         Map<String, Object> response = new HashMap<>();
         try {
             boolean registered = loginService.registerUser(user);
             if (registered) {
                 response.put("success", true);
                 response.put("message", "회원가입이 완료되었습니다.");
                 response.put("redirectUrl", "/login");
                 return ResponseEntity.ok(response);
             } else {
                 response.put("success", false);
                 response.put("message", "DUPLICATE_ID");
                 return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
             }
         } catch (IllegalArgumentException e) {
             response.put("success", false);
             response.put("message", e.getMessage());
             return ResponseEntity.badRequest().body(response);
         } catch (Exception e) {
             e.printStackTrace();
             response.put("success", false);
             response.put("message", "회원가입 처리 중 오류가 발생했습니다.");
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
         }
     }
}