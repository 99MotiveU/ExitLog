package com.exitlog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;


//Redis Scheduler 활성화
@EnableScheduling
@SpringBootApplication
public class ExitLogApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExitLogApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}
