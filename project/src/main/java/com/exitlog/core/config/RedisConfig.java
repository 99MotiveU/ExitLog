package com.exitlog.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration; // 추가된 import
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration; // 추가된 import
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    @Value("${spring.data.redis.password}")
    private String password;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // 1. RedisStandaloneConfiguration을 사용하여 호스트, 포트, 비밀번호 설정
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(host);
        redisStandaloneConfiguration.setPort(port);
        redisStandaloneConfiguration.setPassword(password);

        // 2. LettuceClientConfiguration을 사용하여 SSL/TLS 활성화 
        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                                                    .useSsl()
                                                    .build();

        // 3. RedisStandaloneConfiguration과 LettuceClientConfiguration을 사용하여 LettuceConnectionFactory 생성
        return new LettuceConnectionFactory(redisStandaloneConfiguration, clientConfig);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        // redisConnectionFactory()를 직접 호출하는 대신, 매개변수로 주입받는 것이 좋습니다.
        template.setConnectionFactory(redisConnectionFactory);

        StringRedisSerializer serializer = new StringRedisSerializer();
        template.setKeySerializer(serializer);
        template.setValueSerializer(serializer);
        template.afterPropertiesSet(); // 모든 속성 설정 후 초기화

        return template;
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        // redisConnectionFactory()를 직접 호출하는 대신, 매개변수로 주입받는 것이 좋습니다.
        return new StringRedisTemplate(redisConnectionFactory);
    }
}