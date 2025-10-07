package com.exitlog.core.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.exitlog.core.interceptor.UserInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer{
	@Autowired
	UserInterceptor userInterceptor;
	/**
	 * 게시글(Log)작성 시 이미지를 불러올 때 저장 경로를 지정한 메서드
	 * 부모 폴더의 imgUpload 폴더에 저장된다.
	 */
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		//swagger 의존성과 충돌 피하기 위한 정적 리소스 명시적 매핑
        registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/static/", "classpath:/public/", "classpath:/resources/")
        .setCachePeriod(3600);
        
		String baseUploadPath = Paths.get(System.getProperty("user.dir")).getParent().resolve("imgUpload").toString();
		registry.addResourceHandler("/upload/post/**")
			.addResourceLocations("file:"+baseUploadPath+"/postImages/");

		registry.addResourceHandler("/upload/verify/**")
		.addResourceLocations("file:"+baseUploadPath+"/verificationFiles/");
		
	}
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(userInterceptor)
			.excludePathPatterns("/login","/css/**", "/images/**", "/js/**","/error")//정적 파일 무시
			.addPathPatterns("/log/**/edit")
			.addPathPatterns("/log/write")
			.addPathPatterns("/mypage/**")
			.addPathPatterns("/admin/**");
			
	}
}
