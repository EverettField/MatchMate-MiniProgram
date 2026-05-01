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

    public User findOrCreate(String openid, String avatar, String nickname) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getOpenid, openid);
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setNickname(nickname != null && !nickname.isEmpty() ? nickname : "新用户");
            user.setAvatar(avatar);
            user.setProfileCompleted(false);
            userMapper.insert(user);
        }
        return user;
    }


    // 正确的方法：参数顺序 + 名称完全正确
    public void updateProfile(Long userId, String nickname, String avatar, String grade, String major, List<String> skills) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setNickname(nickname);
            if (avatar != null && !avatar.isEmpty()) {
                user.setAvatar(avatar);
            }
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