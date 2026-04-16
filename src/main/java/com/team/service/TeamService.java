package com.team.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.team.entity.Team;
import com.team.entity.User;
import com.team.mapper.TeamMapper;
import com.team.util.MatchUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {
    @Autowired
    private TeamMapper teamMapper;
    @Autowired
    private UserService userService;

    public Long createTeam(Team team) {
        team.setStatus("active");
        team.setCurrentCount(1);
        team.setCreateTime(LocalDateTime.now());
        teamMapper.insert(team);
        return team.getId();
    }

    public List<Map<String, Object>> getRecommendList(Long currentUserId, String typeFilter) {
        // 获取当前用户的技能
        String userSkills = "";
        if (currentUserId != null) {
            User user = userService.getById(currentUserId);
            if (user != null && user.getSkills() != null) {
                userSkills = user.getSkills();
            }
        }
        // 查询所有 active 组队
        LambdaQueryWrapper<Team> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Team::getStatus, "active");
        if ("contest".equals(typeFilter)) {
            wrapper.eq(Team::getType, "contest");
        } else if ("course".equals(typeFilter)) {
            wrapper.eq(Team::getType, "course");
        }
        // 默认 all 不添加类型条件
        List<Team> teams = teamMapper.selectList(wrapper);

        // 计算匹配度并组装返回数据
        List<Map<String, Object>> result = new ArrayList<>();
        for (Team team : teams) {
            int matchRate = MatchUtil.calculateMatchRate(userSkills, team.getRequiredSkills());
            User publisher = userService.getById(team.getUserId());
            Map<String, Object> item = new HashMap<>();
            item.put("id", team.getId());
            item.put("title", team.getTitle());
            item.put("type", team.getType());
            item.put("requiredSkills", Arrays.asList(team.getRequiredSkills().split(",")));
            item.put("neededCount", team.getNeededCount());
            item.put("currentCount", team.getCurrentCount());
            item.put("matchRate", matchRate);
            if (publisher != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("nickname", publisher.getNickname());
                userMap.put("avatar", publisher.getAvatar());
                userMap.put("grade", publisher.getGrade());
                userMap.put("major", publisher.getMajor());
                userMap.put("college", "软件学院");
                item.put("user", userMap);
            }
            item.put("createTime", team.getCreateTime());
            result.add(item);
        }
        // 按匹配度降序，相同按发布时间倒序
        result.sort((a, b) -> {
            int rateCompare = Integer.compare((int)b.get("matchRate"), (int)a.get("matchRate"));
            if (rateCompare != 0) return rateCompare;
            LocalDateTime timeA = (LocalDateTime) a.get("createTime");
            LocalDateTime timeB = (LocalDateTime) b.get("createTime");
            return timeB.compareTo(timeA);
        });
        return result;
    }

    public Team getTeamDetail(Long teamId) {
        return teamMapper.selectById(teamId);
    }

    public List<Map<String, Object>> getMyTeams(Long userId) {
        LambdaQueryWrapper<Team> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Team::getUserId, userId)
                .eq(Team::getStatus, "active");
        List<Team> teams = teamMapper.selectList(wrapper);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Team team : teams) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", team.getId());
            item.put("title", team.getTitle());
            item.put("type", team.getType());
            item.put("status", team.getStatus());
            item.put("createTime", team.getCreateTime());
            result.add(item);
        }
        return result;
    }

    public boolean closeTeam(Long teamId, Long userId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null || !team.getUserId().equals(userId)) {
            return false;
        }
        team.setStatus("closed");
        teamMapper.updateById(team);
        return true;
    }
}
