// pages/myTeams/myTeams.js
const request = require('../../utils/request');

Page({
  data: {
    myTeams: [],
    createdTeams: [],
    joinedTeams: [],
    activeTab: 0,
    isLoading: false,
    emptyText: '暂无参与的组队'
  },

  onLoad() {
    this.loadMyTeams();
  },

  onShow() {
    this.loadMyTeams();
  },

  onPullDownRefresh() {
    this.loadMyTeams();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 类型映射方法
  getCategoryName(type) {
    const map = { contest: '竞赛组队', course: '课业组队' };
    return map[type] || type || '其他';
  },

  // 加载我参与的组队
  loadMyTeams() {
    this.setData({ isLoading: true });

    const userInfo = wx.getStorageSync('userInfo') || {};
    const nickname = userInfo.nickname || '';
    let allTeams = wx.getStorageSync('teams') || [];

    console.log('当前用户:', nickname);
    console.log('所有组队:', allTeams);

    // 筛选我创建的组队（通过 creator 或 creatorId 匹配）
    const createdTeams = allTeams.filter(team => 
      team.creator === nickname || 
      team.creatorId === nickname
    );

    // 筛选我加入的组队（通过members数组判断）
    const joinedTeams = allTeams.filter(team => {
      if (!team.members) return false;
      return team.members.some(member => 
        (member.nickname === nickname || member.creatorId === nickname) && 
        member.nickname !== team.creator
      );
    });

    // 合并去重
    const myTeams = [...createdTeams, ...joinedTeams];

    // 更新标签状态
    const updatedMyTeams = myTeams.map(team => ({
      ...team,
      category: this.getCategoryName(team.category || team.type),
      tags: team.tags || team.skills || (team.type ? [team.type] : []),
      isCreator: team.creator === nickname || team.creatorId === nickname
    }));

    this.setData({
      myTeams: updatedMyTeams,
      createdTeams: createdTeams.map(team => ({
        ...team,
        category: this.getCategoryName(team.category || team.type),
        tags: team.tags || team.skills || (team.type ? [team.type] : []),
        isCreator: true
      })),
      joinedTeams: joinedTeams.map(team => ({
        ...team,
        category: this.getCategoryName(team.category || team.type),
        tags: team.tags || team.skills || (team.type ? [team.type] : []),
        isCreator: false
      })),
      isLoading: false,
      emptyText: this.data.activeTab === 0 ? '暂无参与的组队' : 
                 this.data.activeTab === 1 ? '暂无创建的组队' : '暂无加入的组队'
    });

    // 从服务器获取最新数据
    request({
      url: '/api/team/my',
      method: 'GET'
    }).then(res => {
      if (res.data) {
        const teams = res.data.map(team => ({
          ...team,
          // 兼容创建者字段名
          creator: team.creator || team.nickname || team.user?.nickname || team.user?.name || '未知用户',
          creatorAvatar: team.creatorAvatar || team.avatar || team.user?.avatar || '/images/default-avatar.svg',
          // 兼容类型字段
          category: this.getCategoryName(team.category || team.type),
          tags: team.tags || team.requiredSkills || (team.type ? [team.type] : []),
          isCreator: true
        }));
        const created = teams.filter(t => t.isCreator);
        const joined = teams.filter(t => !t.isCreator);
        this.setData({
          myTeams: teams,
          createdTeams: created,
          joinedTeams: joined
        });
      }
    }).catch(() => {});
  },

  // 切换标签
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({
      activeTab: index,
      emptyText: index === 0 ? '暂无参与的组队' : 
                 index === 1 ? '暂无创建的组队' : '暂无加入的组队'
    });
  },

  // 获取当前显示的列表
  getCurrentList() {
    const { activeTab, myTeams, createdTeams, joinedTeams } = this.data;
    switch (activeTab) {
      case 0: return myTeams;
      case 1: return createdTeams;
      case 2: return joinedTeams;
      default: return myTeams;
    }
  },

  // 查看详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teamDetail/teamDetail?id=${id}`
    });
  },

  // 退出组队
  onQuitTeam(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认退出',
      content: '确定要退出该组队吗？',
      success: (res) => {
        if (res.confirm) {
          this.quitTeam(id);
        }
      }
    });
  },

  quitTeam(teamId) {
    const userInfo = wx.getStorageSync('userInfo') || {};
    let teams = wx.getStorageSync('teams') || [];
    
    teams = teams.map(team => {
      if (team.id === teamId) {
        const members = (team.members || []).filter(m => m.nickname !== userInfo.nickname);
        return { ...team, members };
      }
      return team;
    });

    wx.setStorageSync('teams', teams);
    this.loadMyTeams();
    wx.showToast({ title: '已退出组队', icon: 'success' });
  },

  // 跳转到发布组队页面
  goToCreate() {
    wx.navigateTo({
      url: '/pages/teamCreate/teamCreate'
    });
  },

  // 下架组队
  onOffShelf(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认下架',
      content: '确定要下架该组队吗？下架后其他人将无法查看和加入。',
      success: (res) => {
        if (res.confirm) {
          this.offShelfTeam(id);
        }
      }
    });
  },

  offShelfTeam(teamId) {
    // 先从本地列表移除
    this.setData({
      myTeams: this.data.myTeams.filter(t => t.id !== teamId),
      createdTeams: this.data.createdTeams.filter(t => t.id !== teamId),
      joinedTeams: this.data.joinedTeams.filter(t => t.id !== teamId)
    });

    request({
      url: '/api/team/close',
      method: 'PUT',
      data: { teamId }
    }).then(res => {
      if (res.success) {
        wx.showToast({ title: '已下架', icon: 'success' });
        // 延迟刷新，确保列表已更新
        setTimeout(() => this.loadMyTeams(), 500);
      } else {
        wx.showToast({ title: res.message || '下架失败', icon: 'none' });
        // 失败时恢复列表
        this.loadMyTeams();
      }
    }).catch(() => {
      wx.showToast({ title: '下架失败', icon: 'none' });
      // 失败时恢复列表
      this.loadMyTeams();
    });
  }
});
