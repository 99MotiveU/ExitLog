package com.exitlog.login.service;

import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * 서블릿 컴포넌트 (예: @WebListener, @WebServlet, @WebFilter)를 스캔하도록 설정합니다.
 * 이를 통해 SessionListener가 정상적으로 등록됩니다.
 */
@Configuration
@ServletComponentScan // 이 어노테이션을 추가하여 @WebListener를 스캔합니다.
public class LoginConfig {
}