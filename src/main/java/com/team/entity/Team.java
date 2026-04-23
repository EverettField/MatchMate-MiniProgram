package com.team.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("team_request")
public class Team {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String type;          // contest / course
    private String title;
    private String description;
    private String requiredSkills;
    private Integer neededCount;
    private Integer currentCount;
    private String contact;
    private String status;        // active / closed
    private LocalDateTime createTime;
}