package com.team.util;

import java.util.*;

public class MatchUtil {
    // 简单交集百分比
    public static int calculateMatchRate(String userSkillsStr, String requiredSkillsStr) {
        if (requiredSkillsStr == null || requiredSkillsStr.isEmpty()) return 0;
        Set<String> userSet = new HashSet<>();
        if (userSkillsStr != null && !userSkillsStr.isEmpty()) {
            userSet.addAll(Arrays.asList(userSkillsStr.split(",")));
        }
        List<String> requiredList = Arrays.asList(requiredSkillsStr.split(","));
        long matchCount = requiredList.stream().filter(userSet::contains).count();
        return (int) (matchCount * 100 / requiredList.size());
    }
}