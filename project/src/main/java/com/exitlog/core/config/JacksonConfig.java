package com.exitlog.core.config;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

/**
 * Spring 내부의 ObjectMapper에서 LocalDateTime 직렬화를 허용하기 위해
 * jackson 설정을 Spring web에서 따로 해줘야 함
 * - redisTemplate에서도 이와 관련한 objectMapper 설정을 한다.
 */
@Configuration
public class JacksonConfig {
	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	
	/** api 요청을 레디스로 넘기면서 LocalDateTime을 직렬화 하지 못하는 문제 발생 -> 
	 * objectMapper을 커스터마이징해서 timestamp가 아닌 날짜 문자열로 보이도록한다.
	 * @return Jackson2ObjectMapperBuilderCustomizer
	 *        -> jackson 설정해주는 Bean 커스터마이저
	 */
	// 스프링 부트가 내부에서 사용하는 ObjectMapper를 커스터마이즈하는 빈을 등록
	@Bean
	public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> {
        	// Java 8 날짜/시간 관련 타입 지원 모듈 생성
            JavaTimeModule javaTimeModule = new JavaTimeModule();
            // LocalDateTime에 대해 커스텀 직렬화기 등록
            javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer());
            // LocalDateTime에 대해 커스텀 역직렬화기 등록
            javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer());

            // builder에 위에서 만든 모듈 등록
            builder.modules(javaTimeModule);
            // JSON 직렬화 시 타임스탬프(long 숫자) 대신 ISO 문자열 형태로 출력하도록 설정
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
	}

	// LocalDateTime을 JSON 문자열로 변환하는 직렬화기 구현
    static class LocalDateTimeSerializer extends com.fasterxml.jackson.databind.JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime value, com.fasterxml.jackson.core.JsonGenerator gen,
                              com.fasterxml.jackson.databind.SerializerProvider serializers) throws java.io.IOException {
        	// LocalDateTime 값을 지정한 FORMATTER 포맷의 문자열로 변환해서 JSON에 씀
        	gen.writeString(value.format(FORMATTER));
        }
    }

    // JSON 문자열을 LocalDateTime 객체로 변환하는 역직렬화기 구현
    static class LocalDateTimeDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p,
                                         com.fasterxml.jackson.databind.DeserializationContext ctxt) throws java.io.IOException {
        	// JSON에서 읽은 문자열을 FORMATTER 포맷으로 해석해 LocalDateTime 객체 생성
        	return LocalDateTime.parse(p.getValueAsString(), FORMATTER);
        }
    }
}
