// pages/teamRecommend/teamRecommend.js
const request = require('../../utils/request');

Page({
  data: {
    teams: [],
    filteredTeams: [],
    searchKeyword: '',
    typeFilters: ['全部', '学科竞赛', '户外运动', '互联网+', '考证考研'],
    typeIndex: 0,
    isLoading: false
  },

  onLoad() {
    this.loadTeams();
  },

  onShow() {
    this.loadTeams();
  },

  onPullDownRefresh() {
    this.loadTeams();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 加载组队列表
  loadTeams() {
    this.setData({ isLoading: true });

    // 从本地存储获取
    let teams = wx.getStorageSync('teams') || [];
    
    // 添加一些示例数据（如果没有数据）
    if (teams.length === 0) {
      teams = this.getMockTeams();
      wx.setStorageSync('teams', teams);
    }

    teams = teams.map(item => ({
      ...item,
      category: item.category || item.type || '其他',
      tags: item.tags || (item.type ? [item.type] : []),
      matchPercentage: item.matchPercentage || 0
    }));

    this.setData({ 
      teams,
      filteredTeams: teams,
      isLoading: false
    });

    // 尝试从服务器获取最新数据
    request({
      url: '/api/team/list',
      method: 'GET'
    }).then(res => {
      if (res.data && res.data.length > 0) {
        const latestTeams = res.data.map(item => ({
          ...item,
          category: item.category || item.type || '其他',
          tags: item.tags || (item.type ? [item.type] : []),
          matchPercentage: item.matchPercentage || 0
        }));
        this.setData({ 
          teams: latestTeams,
          filteredTeams: latestTeams
        });
      }
    }).catch(() => {});
  },

  // 获取模拟数据
  getMockTeams() {
    return [

    ];
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterTeams();
  },

  // 筛选类型
  onTypeChange(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({
      typeIndex: index
    });
    this.filterTeams();
  },

  // 筛选队伍
  filterTeams() {
    const { teams, searchKeyword, typeIndex, typeFilters } = this.data;
    let filtered = teams;

    // 类型筛选
    if (typeIndex > 0) {
      filtered = filtered.filter(t => t.category === typeFilters[typeIndex]);
    }

    // 关键词筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword) ||
        t.school.toLowerCase().includes(keyword)
      );
    }

    this.setData({ filteredTeams: filtered });
  },

  // 查看详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teamDetail/teamDetail?id=${id}`
    });
  },

  // 跳转到发布页
  goToCreate() {
    wx.navigateTo({
      url: '/pages/teamCreate/teamCreate'
    });
  }
});
