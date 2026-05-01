// pages/teamDetail/teamDetail.js
const request = require('../../utils/request');

Page({
  data: {
    team: null,
    isOwner: false,
    isApplied: false,
    userInfo: null
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadTeamDetail(id);
    }
    
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo });
  },

  // 加载组队详情
  loadTeamDetail(id) {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const teams = wx.getStorageSync('teams') || [];
    const team = teams.find(t => t.id === id);
    
    // 优先从本地获取
    if (team) {
      const isOwner = team.creatorId === (userInfo.id || userInfo.userId);
      
      // 检查是否已申请
      const applications = wx.getStorageSync('applications') || [];
      const isApplied = applications.some(a => a.teamId === id && a.applicant === userInfo.nickname);
      
      // 处理技能标签：如果是字符串则转为数组
      const parseSkills = (skills) => {
        if (Array.isArray(skills)) return skills;
        if (typeof skills === 'string' && skills) return skills.split(',').map(s => s.trim());
        return [];
      };
      
      const formattedTeam = {
        ...team,
        requiredSkills: parseSkills(team.requiredSkills || team.tags || team.skills),
        tags: parseSkills(team.tags || team.skills || team.requiredSkills),
        currentCount: team.currentCount || 1,
        neededCount: team.neededCount || 1,
        createTime: team.createTime || '',
        user: {
          userId: userInfo.id,
          nickname: team.creator || '匿名用户',
          avatar: team.creatorAvatar || '/images/default-avatar.svg',
          grade: team.grade || '',
          major: team.major || '',
          college: team.school || ''
        }
      };

      this.setData({ 
        team: formattedTeam,
        isOwner,
        isApplied
      });
    }

    // 从服务器获取最新数据（可选，记录浏览足迹）
    // Authorization 已由 request.js 自动添加

    request({
      url: `/api/team/detail?teamId=${id}`,
      method: 'GET'
    }).then(res => {
      if (res.data) {
        const teamData = res.data;
        const isOwner = teamData.userId === (userInfo.id || userInfo.userId);
        
        // 处理技能标签：如果是字符串则转为数组
        const parseSkills = (skills) => {
          if (Array.isArray(skills)) return skills;
          if (typeof skills === 'string' && skills) return skills.split(',').map(s => s.trim());
          return [];
        };
        
        // 处理用户信息：兼容后端返回的不同字段名
        const creator = teamData.creator || teamData.nickname || teamData.user?.nickname || '匿名用户';
        const creatorAvatar = teamData.creatorAvatar || teamData.avatar || teamData.user?.avatar || '/images/default-avatar.svg';
        const school = teamData.school || teamData.user?.school || teamData.user?.college || '';
        const grade = teamData.grade || teamData.user?.grade || '';
        const major = teamData.major || teamData.user?.major || '';
        
        // 先用本地数据更新，再用 API 数据覆盖
        const formattedTeam = {
          ...this.data.team,
          ...teamData,
          creator,
          creatorAvatar,
          school,
          grade,
          major,
          requiredSkills: parseSkills(teamData.requiredSkills || teamData.tags || teamData.skills),
          tags: parseSkills(teamData.tags || teamData.skills || teamData.requiredSkills),
          // 兼容匹配度字段名
          matchPercentage: teamData.matchPercentage || teamData.matchRate || teamData.match_score || 0
        };

        this.setData({ 
          team: formattedTeam,
          isOwner,
          isApplied: this.data.isApplied
        });

        // 处理云存储头像
        if (creatorAvatar && creatorAvatar.startsWith('cloud://')) {
          this.loadAvatarUrl(creatorAvatar);
        }
      }
    }).catch((err) => {
      if (err.status === 404) {
        wx.showToast({ title: '未找到该组队', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else if (err.status === 400) {
        wx.showToast({ title: '参数错误', icon: 'none' });
      }
    });
  },

  // 申请加入
  onApply() {
    const { team, userInfo } = this.data;
    
    // if (!userInfo || !userInfo.nickname) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请先登录',
    //     success: () => {
    //       wx.switchTab({ url: '/pages/login/login' });
    //     }
    //   });
    //   return;
    // }

    // if (this.data.isApplied) {
    //   wx.showToast({ title: '您已申请过', icon: 'none' });
    //   return;
    // }

    // if (team.currentNum >= team.maxNum) {
    //   wx.showToast({ title: '队伍已满员', icon: 'none' });
    //   return;
    // }

    // wx.showModal({
    //   title: '申请加入',
    //   content: `确定要申请加入"${team.title}"吗？`,
    //   success: (res) => {
    //     if (res.confirm) {
    //       this.submitApplication();
    //     }
    //   }
    // });
  },

  // 提交申请
  submitApplication() {
    const { team, userInfo } = this.data;
    
    const application = {
      id: Date.now().toString(),
      teamId: team.id,
      teamTitle: team.title,
      applicant: userInfo.nickname,
      applicantName: userInfo.nickname,
      contact: userInfo.wechat || userInfo.phone,
      createTime: new Date().toLocaleString(),
      status: '待审核'
    };

    // 保存申请记录
    const applications = wx.getStorageSync('applications') || [];
    applications.push(application);
    wx.setStorageSync('applications', applications);

    // 同步到服务器
    request({
      url: '/api/team/apply',
      method: 'POST',
      data: application
    }).catch(() => {});

    this.setData({ isApplied: true });
    wx.showToast({ title: '申请成功，请等待回复', icon: 'success' });
  },

  // 复制联系方式
  onCopyContact() {
    const { team } = this.data;
    if (team.contact) {
      wx.setClipboardData({
        data: team.contact,
        success: () => {
          wx.showToast({ title: '已复制微信号', icon: 'success' });
        }
      });
    }
  },

  // 获取云存储头像的临时链接
  loadAvatarUrl(fileID) {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        if (res.fileList[0].status === 0) {
          const team = this.data.team;
          this.setData({
            team: {
              ...team,
              creatorAvatar: res.fileList[0].tempFileURL
            }
          });
        }
      },
      fail: (err) => {
        console.error('获取头像临时链接失败:', err);
      }
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.redirectTo({ url: '/pages/teamRecommend/teamRecommend' });
    }
  },

  // 分享
  onShareAppMessage() {
    const { team } = this.data;
    return {
      title: `${team.title} - 校园组队`,
      path: `/pages/teamDetail/teamDetail?id=${team.id}`,
      imageUrl: ''
    };
  }
});
