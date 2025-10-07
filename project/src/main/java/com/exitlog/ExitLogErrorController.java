 package com.exitlog;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/error")
public class ExitLogErrorController implements ErrorController{

    /** 작성하지 않은 글의 수정 페이지에 진입하는 경우
     * @param request
     * @return
     */
    @GetMapping("/unAuthorized")
    public String handleError(HttpServletRequest request) {
        return "error/unAuthorized"; // templates/error/customError.html
    }
}
