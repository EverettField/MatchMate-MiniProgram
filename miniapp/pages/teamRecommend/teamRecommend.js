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
      {
        id: '1',
        title: '2026大学生数学建模竞赛',
        category: '学科竞赛',
        tags: ['MATLAB', '论文写作', '建模算法'],
        matchPercentage: 98,
        school: '计算机学院',
        creator: '林嘉欣',
        description: '准备参加2026年大学生数学建模竞赛，寻找擅长编程和数学的队友。',
        requirements: '熟悉MATLAB，有建模经验优先',
        createTime: '2026-04-01',
        status: '招募中'
      },
      {
        id: '2',
        title: '校园生活助手小程序开发',
        category: '互联网+',
        tags: ['前端开发', 'UI设计'],
        matchPercentage: 92,
        school: '软件工程',
        creator: '陈子安',
        description: '正在开发一个校园生活服务小程序，欢迎有前端经验的同学加入。',
        requirements: '熟悉微信小程序开发，有UI设计经验更好',
        createTime: '2026-03-28',
        status: '招募中'
      },
      {
        id: '3',
        title: '西藏毕业旅行搭子(招5人)',
        category: '户外运动',
        tags: ['驾驭技术', '摄影摄像'],
        matchPercentage: 89,
        school: '艺术学院',
        creator: '王泽雨',
        description: '毕业旅行团队招募，计划西藏路线，欢迎热爱摄影和徒步的同学。',
        requirements: '热爱旅行，能承担部分费用',
        createTime: '2026-03-20',
        status: '招募中'
      },
      {
        id: '4',
        title: '周日图书馆六楼考研刷题',
        category: '考证考研',
        tags: ['英语二', '数学一'],
        matchPercentage: 85,
        school: '经济学院',
        creator: '刘晨',
        description: '周末一起去图书馆复习考研，欢迎目标院校明确的同学加入。',
        requirements: '目标考研院校明确，每周至少2次到场',
        createTime: '2026-03-18',
        status: '招募中'
      }
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
