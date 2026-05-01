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
            item.put("title", team.getTitle());          // 注意：用 getTitle()，不是 getName()
            item.put("type", team.getType());            // 注意：用 getType()
            // 关键：将逗号分隔字符串转为数组
            List<String> skillsList = Arrays.asList(team.getRequiredSkills().split(","));
            item.put("requiredSkills", skillsList);
            item.put("neededCount", team.getNeededCount());
            item.put("currentCount", team.getCurrentCount());
            item.put("matchRate", matchRate);

            Map<String, Object> userMap = new HashMap<>();
            if (publisher == null) {
                userMap.put("userId", null);
                userMap.put("nickname", "未知用户");
                userMap.put("avatar", "");
                userMap.put("grade", "");
                userMap.put("major", "");
            } else {
                userMap.put("userId", publisher.getId());
                userMap.put("nickname", publisher.getNickname() != null ? publisher.getNickname() : "新用户");
                userMap.put("avatar", publisher.getAvatar() != null ? publisher.getAvatar() : "");
                userMap.put("grade", publisher.getGrade() != null ? publisher.getGrade() : "");
                userMap.put("major", publisher.getMajor() != null ? publisher.getMajor() : "");
            }
            userMap.put("college", "软件学院");
            item.put("user", userMap);
            item.put("createTime", team.getCreateTime());

            result.add(item);
        }
        // 按匹配度降序，相同按发布时间倒序
        result.sort((a, b) -> {
            int rateCompare = Integer.compare((int) b.get("matchRate"), (int) a.get("matchRate"));
            if (rateCompare != 0) return rateCompare;
            LocalDateTime timeA = (LocalDateTime) a.get("createTime");
            LocalDateTime timeB = (LocalDateTime) b.get("createTime");
            return timeB.compareTo(timeA);
        });
        return result;
    }

    public Map<String, Object> getTeamDetail(Long teamId, Long currentUserId) {
        Team team = teamMapper.selectById(teamId);
        if (team == null) {
            return null;
        }

        // 计算当前用户与该组队的匹配度
        String userSkills = "";
        if (currentUserId != null) {
            User user = userService.getById(currentUserId);
            if (user != null && user.getSkills() != null) {
                userSkills = user.getSkills();
            }
        }
        int matchRate = MatchUtil.calculateMatchRate(userSkills, team.getRequiredSkills());

        User publisher = userService.getById(team.getUserId());

        Map<String, Object> data = new HashMap<>();
        data.put("id", team.getId());
        data.put("type", team.getType());
        data.put("title", team.getTitle());
        data.put("description", team.getDescription());
        data.put("requiredSkills", Arrays.asList(team.getRequiredSkills().split(",")));
        data.put("neededCount", team.getNeededCount());
        data.put("currentCount", team.getCurrentCount());
        data.put("contact", team.getContact());
        data.put("status", team.getStatus());
        data.put("matchRate", matchRate);  // 新增这行
        data.put("createTime", team.getCreateTime());

        Map<String, Object> userMap = new HashMap<>();
        if (publisher == null) {
            userMap.put("userId", null);
            userMap.put("nickname", "未知用户");
            userMap.put("avatar", "");
            userMap.put("grade", "");
            userMap.put("major", "");
        } else {
            userMap.put("userId", publisher.getId());
            userMap.put("nickname", publisher.getNickname() != null ? publisher.getNickname() : "新用户");
            userMap.put("avatar", publisher.getAvatar() != null ? publisher.getAvatar() : "");
            userMap.put("grade", publisher.getGrade() != null ? publisher.getGrade() : "");
            userMap.put("major", publisher.getMajor() != null ? publisher.getMajor() : "");
        }
        userMap.put("college", "软件学院");
        data.put("user", userMap);

        return data;
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
