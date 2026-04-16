package com.team.controller;

import com.team.common.Result;
import com.team.entity.Team;
import com.team.service.TeamService;
import com.team.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @PostMapping("/create")
    public Result<Map<String, Long>> createTeam(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Team team) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.error(401, "未登录");
        }
        String token = authHeader.substring(7);
        Long userId = JwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            return Result.error(401, "token无效");
        }
        // 校验必填字段
        if (team.getType() == null || team.getTitle() == null || team.getRequiredSkills() == null || team.getContact() == null) {
            return Result.error(400, "缺少必填字段");
        }
        team.setUserId(userId);
        Long teamId = teamService.createTeam(team);
        Map<String, Long> data = new HashMap<>();
        data.put("teamId", teamId);
        return Result.success(data);
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
    public Result<Team> detail(@RequestParam("teamId") Long teamId) {
        Team team = teamService.getTeamDetail(teamId);
        if (team == null) {
            return Result.error(404, "组队不存在");
        }
        return Result.success(team);
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