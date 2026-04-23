package com.team.controller;

import com.team.common.Result;
import com.team.entity.Team;
import com.team.service.TeamService;
import com.team.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.team.entity.User;
import com.team.service.UserService;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/team")
@SuppressWarnings("unused")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @PostMapping("/create")
    public Result<Map<String, Long>> createTeam(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> params) {
        // 1. 验证 token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录");
        }
        String token = authHeader.substring(7);
        Long userId = JwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return Result.error(401, "token无效");
        }

        // 2. 提取字段
        String type = (String) params.get("type");
        String title = (String) params.get("title");
        String description = (String) params.get("description");
        // 关键：前端传的是数组，用 List 接收
        List<String> skills = (List<String>) params.get("requiredSkills");
        Integer neededCount = (Integer) params.get("neededCount");
        String contact = (String) params.get("contact");

        // 3. 参数校验
        if (type == null || title == null || skills == null || neededCount == null || contact == null) {
            return Result.error(400, "缺少必填字段");
        }
        if (skills.isEmpty()) {
            return Result.error(400, "至少选择一个技能");
        }

        // 4. 创建 Team 实体并赋值
        Team team = new Team();
        team.setUserId(userId);
        team.setType(type);
        team.setTitle(title);
        team.setDescription(description);
        // 将技能列表转为逗号分隔字符串存储
        team.setRequiredSkills(String.join(",", skills));
        team.setNeededCount(neededCount);
        team.setContact(contact);
        // 其他字段（currentCount、status、createTime）在 service 里默认设置，也可以在这里设
        team.setCurrentCount(1);
        team.setStatus("active");
        team.setCreateTime(LocalDateTime.now());

        // 5. 调用 service 保存
        Long teamId = teamService.createTeam(team);
        return Result.success(Map.of("teamId", teamId));
    }

    @GetMapping("/recommend")
    public Result<List<Map<String, Object>>> recommend(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "type", defaultValue = "all") String type) {
        Long userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            userId = JwtUtil.getUserIdFromToken(token);
        }
        List<Map<String, Object>> list = teamService.getRecommendList(userId, type);
        return Result.success(list);
    }

    @GetMapping("/detail")
    public Result<Map<String, Object>> detail(@RequestParam("teamId") Long teamId) {
        Map<String, Object> data = teamService.getTeamDetail(teamId);  // 注意方法名是 getTeamDetail
        if (data == null) {
            return Result.error(404, "组队不存在");
        }
        return Result.success(data);
    }

    @GetMapping("/my")
    public Result<List<Map<String, Object>>> myTeams(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录");
        }
        String token = authHeader.substring(7);
        Long userId = JwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return Result.error(401, "token无效");
        }
        List<Map<String, Object>> list = teamService.getMyTeams(userId);
        return Result.success(list);
    }

    @PutMapping("/close")
    public Result<Void> closeTeam(@RequestHeader("Authorization") String authHeader,
                                  @RequestBody Map<String, Long> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录");
        }
        String token = authHeader.substring(7);
        Long userId = JwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return Result.error(401, "token无效");
        }
        Long teamId = body.get("teamId");
        if (teamId == null) {
            return Result.error(400, "缺少 teamId");
        }
        boolean success = teamService.closeTeam(teamId, userId);
        if (!success) {
            return Result.error(404, "组队不存在或无权操作");
        }
        return Result.success(null);
    }
}