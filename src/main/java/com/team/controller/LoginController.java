package com.team.controller;

import com.team.common.Result;
import com.team.entity.User;
import com.team.service.UserService;
import com.team.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        // 模拟真实微信登录：实际应调用微信接口换取 openid
        // 为了演示，直接用 mock_openid_ + code
        String openid = "mock_openid_" + code;
        User user = userService.findOrCreate(openid);
        String token = JwtUtil.generateToken(user.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("profileCompleted", user.getProfileCompleted());
        return Result.success(data);
    }
}