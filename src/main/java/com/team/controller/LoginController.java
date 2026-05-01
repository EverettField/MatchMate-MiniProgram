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
        String avatar = params.get("avatar");      // 新增：获取头像
        String nickname = params.get("nickname");  // 新增：获取昵称

        // 模拟真实微信登录：实际应调用微信接口换取 openid
        // 为了演示，直接用 mock_openid_ + code
        String openid = "mock_openid_" + code;

        // 修改：传递 avatar 和 nickname 给 service 层
        User user = userService.findOrCreate(openid, avatar, nickname);

        String token = JwtUtil.generateToken(user.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("nickname", user.getNickname());    // 新增：返回昵称
        data.put("avatar", user.getAvatar());        // 新增：返回头像
        data.put("profileCompleted", user.getProfileCompleted());
        return Result.success(data);
    }
}
