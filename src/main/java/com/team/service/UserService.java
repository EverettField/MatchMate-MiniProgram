package com.team.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.team.entity.User;
import com.team.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public User findOrCreate(String openid) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getOpenid, openid);
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname("新用户");
            user.setProfileCompleted(false);
            userMapper.insert(user);
        }
        return user;
    }

    public void updateProfile(Long userId, String grade, String major, List<String> skills) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setGrade(grade);
            user.setMajor(major);
            if (skills != null && !skills.isEmpty()) {
                user.setSkills(String.join(",", skills));
            }
            user.setProfileCompleted(true);
            userMapper.updateById(user);
        }
    }

    public User getById(Long userId) {
        return userMapper.selectById(userId);
    }
}