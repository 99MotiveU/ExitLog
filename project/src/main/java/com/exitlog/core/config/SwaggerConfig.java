package com.exitlog.core.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("exitlog-public")
            .pathsToMatch("/**")
            .build();
    }
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo());
    }
	private Info apiInfo() {
		return new Info()
				.title("ExitLog API")
				.description("ExitLog 프로젝트 API 문서")
				.version("v1.0")
                .contact(new Contact().name("김소영").email("shong7576@gmail.com"))
                .license(new License().name("Apache 2.0").url("http://springdoc.org"));
	}
	
}
