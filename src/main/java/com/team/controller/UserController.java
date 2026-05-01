package com.team.controller;

import com.team.common.Result;
import com.team.service.UserService;
import com.team.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/profile")
    public Result<Void> saveProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录");
        }
        String token = authHeader.substring(7);
        Long userId = JwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return Result.error(401, "token无效");
        }

        String nickname = (String) body.get("nickname");
        String avatar = (String) body.get("avatar");
        String grade = (String) body.get("grade");
        String major = (String) body.get("major");
        List<String> skills = (List<String>) body.get("skills");

        if (nickname == null || nickname.trim().isEmpty()) {
            return Result.error(400, "昵称不能为空");
        }
        if (grade == null || major == null || skills == null || skills.isEmpty()) {
            return Result.error(400, "年级、专业、技能不能为空");
        }

        // 调用正确的方法
        userService.updateProfile(userId, nickname, avatar ,grade, major, skills);
        return Result.success(null);
    }
}