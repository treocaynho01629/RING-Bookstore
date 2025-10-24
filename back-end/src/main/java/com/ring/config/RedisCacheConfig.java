package com.ring.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ring.common.AppConstants;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@EnableCaching
@Configuration
public class RedisCacheConfig {

        public RedisCacheConfiguration cacheConfiguration(Duration duration) {
                ObjectMapper mapper = new ObjectMapper();
                mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                                .registerModule(new JavaTimeModule())
                                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                                .activateDefaultTyping(
                                                BasicPolymorphicTypeValidator.builder()
                                                                .allowIfSubType(Object.class)
                                                                .build(),
                                                ObjectMapper.DefaultTyping.EVERYTHING,
                                                JsonTypeInfo.As.PROPERTY);

                return RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(duration)
                                .disableCachingNullValues()
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new StringRedisSerializer()))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new GenericJackson2JsonRedisSerializer(mapper)));
        }

        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
                RedisCacheConfiguration cacheConfig = cacheConfiguration(Duration.ofMinutes(10));

                return RedisCacheManager.builder(redisConnectionFactory)
                                .cacheDefaults(cacheConfig)
                                .withCacheConfiguration(AppConstants.CALCULATE, cacheConfiguration(Duration.ofMinutes(1)))
                                .withCacheConfiguration(AppConstants.ENUMS, cacheConfiguration(Duration.ofDays(1)))
                                .build();
        }
}
