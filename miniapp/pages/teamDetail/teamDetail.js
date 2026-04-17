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
    // 从本地获取
    const teams = wx.getStorageSync('teams') || [];
    const team = teams.find(t => t.id === id);
    
    if (team) {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const isOwner = team.creatorId === userInfo.username;
      
      // 检查是否已申请
      const applications = wx.getStorageSync('applications') || [];
      const isApplied = applications.some(a => a.teamId === id && a.applicant === userInfo.username);
      
      const formattedTeam = {
        ...team,
        tags: team.tags || team.skills || [],
        currentNum: team.currentNum || 1,
        maxNum: team.maxNum || 1,
        matchPercentage: team.matchPercentage || 0,
        createTime: team.createTime || '',
        school: team.school || '',
        creator: team.creator || '匿名用户',
        grade: team.grade || '',
        gpa: team.gpa || '',
        creatorAvatar: team.creatorAvatar || '/images/default-avatar.png',
        views: team.views || 0
      };

      this.setData({ 
        team: formattedTeam,
        isOwner,
        isApplied
      });
    } else {
      // 尝试从服务器获取
      request({
        url: `/api/team/${id}`,
        method: 'GET'
      }).then(res => {
        if (res.data) {
          const teamData = {
            ...res.data,
            tags: res.data.tags || res.data.skills || [],
            currentNum: res.data.currentNum || 1,
            maxNum: res.data.maxNum || 1,
            matchPercentage: res.data.matchPercentage || 0,
            createTime: res.data.createTime || '',
            school: res.data.school || '',
            creator: res.data.creator || '匿名用户',
            grade: res.data.grade || '',
            gpa: res.data.gpa || '',
            creatorAvatar: res.data.creatorAvatar || '/images/default-avatar.png',
            views: res.data.views || 0
          };
          this.setData({ team: teamData });
        }
      }).catch(() => {
        wx.showToast({ title: '未找到该组队', icon: 'none' });
      });
    }
  },

  // 申请加入
  onApply() {
    const { team, userInfo } = this.data;
    
    if (!userInfo || !userInfo.username) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: () => {
          wx.switchTab({ url: '/pages/login/login' });
        }
      });
      return;
    }

    if (this.data.isApplied) {
      wx.showToast({ title: '您已申请过', icon: 'none' });
      return;
    }

    if (team.currentNum >= team.maxNum) {
      wx.showToast({ title: '队伍已满员', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '申请加入',
      content: `确定要申请加入"${team.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitApplication();
        }
      }
    });
  },

  // 提交申请
  submitApplication() {
    const { team, userInfo } = this.data;
    
    const application = {
      id: Date.now().toString(),
      teamId: team.id,
      teamTitle: team.title,
      applicant: userInfo.username,
      applicantName: userInfo.nickname || userInfo.username,
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
