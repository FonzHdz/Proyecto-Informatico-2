package com.harmoniChat.app_hc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class AppHcApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppHcApplication.class, args);
	}

}