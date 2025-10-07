package com.exitlog.login.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail; // application.properties에서 보낼 이메일 주소 가져옴

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 회원가입용 인증번호 발송 메서드
    public String sendAuthCodeForSignup(String toEmail) throws MessagingException {
        return sendAuthCode(toEmail, "회원가입 인증번호", "signup");
    }

    // 아이디 찾기용 인증번호 발송 메서드 
    public String sendAuthCodeForFindId(String toEmail) throws MessagingException {
        return sendAuthCode(toEmail, "아이디 찾기 인증번호", "findid");
    }
    
    // 비밀번호 찾기용 인증번호 발송 메서드
    public String sendAuthCodeForFindPw(String toEmail) throws MessagingException{
    	return sendAuthCode(toEmail, "비밀번호 찾기 인증번호", "findpw");
    }
    
    // 이메일 변경용 인증번호 발송 메서드
    public String sendAuthCodeForChangEmail(String toEmail) throws MessagingException{
    	return sendAuthCode(toEmail, "이메일 변경 인증번호", "changeEmail");
    }
    
    

    private String sendAuthCode(String toEmail, String subjectPrefix, String purpose) throws MessagingException {
        String authCode = generateRandomCode();

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail); 
        helper.setTo(toEmail);
        helper.setSubject("[ExitLog] " + subjectPrefix + " 안내"); // 제목

        String emailContent = "<p>안녕하세요. ExitLog 입니다.</p>"
                            + "<p>" + subjectPrefix + "는 다음과 같습니다:</p>"
                            + "<h2><strong>" + authCode + "</strong></h2>"
                            + "<p>인증번호는 5분간 유효합니다. 시간 내에 입력해주세요.</p>"
                            + "<p>감사합니다.</p>";

        helper.setText(emailContent, true); // HTML 형식으로 설정

        mailSender.send(message); // 이메일 전송

        return authCode;
    }

    private String generateRandomCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999 (6자리)
        return String.valueOf(code);
    }
}