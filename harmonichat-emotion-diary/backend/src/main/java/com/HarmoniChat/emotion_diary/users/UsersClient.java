package com.HarmoniChat.emotion_diary.users;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

//@FeignClient(name = "hc-users", url = "localhost:xxxx/api/users")
public interface UsersClient {

   //@GetMapping("/search-ny-emotions/{UserId}")
   //List<?> findUserById();
}
