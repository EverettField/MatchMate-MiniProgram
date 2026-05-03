// pages/teamRecommend/teamRecommend.js
const request = require('../../utils/request');

Page({
  data: {
    teams: [],
    filteredTeams: [],
    searchKeyword: '',
    typeFilters: ['全部', '竞赛组队', '课业组队'],
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


    // // 从本地存储获取
    // let teams = wx.getStorageSync('teams') || [];
    
    // // 如果没有数据，显示空列表
    // if (teams.length === 0) {
    //   wx.showToast({ title: '暂无组队信息', icon: 'none' });
    // }

    // teams = teams.map(item => ({
    //   ...item,
    //   type: item.type || 'contest',
    //   category: item.category || (item.type === 'course' ? '课业组队' : '竞赛组队'),
    //   tags: item.requiredSkills || item.tags || item.skills || [],
    //   requiredSkills: item.requiredSkills || item.tags || item.skills || [],
    //   matchRate: item.matchRate || 0
    // }));

    // this.setData({ 
    //   teams,
    //   filteredTeams: teams,
    //   isLoading: false
    // });



    // 根据筛选类型构建URL参数
    const typeIndex = this.data.typeIndex;
    let typeParam = 'all';
    if (typeIndex === 1) typeParam = 'contest';
    if (typeIndex === 2) typeParam = 'course';

    // 从服务器获取最新数据（优先使用服务器数据）
    request({
      url: `/api/team/recommend?type=${typeParam}`,
      method: 'GET'
    }).then(res => {
      if (res.data && res.data.length > 0) {
        // 过滤掉已下架的组队（status = "closed"）
        const activeTeams = res.data.filter(item => item.status !== 'closed');

        const latestTeams = activeTeams.map(item => ({
          ...item,
          type: item.type || 'contest',
          category: item.category || (item.type === 'course' ? '课业组队' : '竞赛组队'),
          tags: item.requiredSkills || item.tags || item.skills || [],
          requiredSkills: item.requiredSkills || item.tags || item.skills || [],
          // 兼容匹配度字段名
          matchPercentage: item.matchPercentage || item.matchRate || item.match_score || 0,
          // 兼容创建者字段名
          creator: item.creator || item.nickname || item.user?.nickname || '匿名用户',
          creatorAvatar: item.creatorAvatar || item.avatar || item.user?.avatar || '/images/default-avatar.svg',
          school: item.school || item.user?.school || item.user?.college || '未填写学校',
          grade: item.grade || item.user?.grade || '',
          major: item.major || item.user?.major || ''
        }));

        // 更新本地缓存
        wx.setStorageSync('teams', res.data);

        this.setData({ 
          teams: latestTeams,
          filteredTeams: latestTeams,
          isLoading: false
        });

        // 头像现在使用 Base64 格式或默认头像，无需额外处理
      } else {
        // 服务器没有数据，清空列表
        this.setData({ 
          teams: [],
          filteredTeams: [],
          isLoading: false
        });
        wx.setStorageSync('teams', []);
        wx.showToast({ title: '暂无组队信息', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ isLoading: false });
    });
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

    // 类型筛选：根据 type 字段 (contest/course)
    if (typeIndex === 1) {
      // 竞赛组队
      filtered = filtered.filter(t => t.type === 'contest');
    } else if (typeIndex === 2) {
      // 课业组队
      filtered = filtered.filter(t => t.type === 'course');
    }

    // 关键词筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword) ||
        t.school.toLowerCase().includes(keyword) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(keyword)))
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

  // 头像加载失败时使用默认头像
  onAvatarError(e) {
    const index = e.currentTarget.dataset.index;
    const teams = this.data.teams;
    if (teams[index]) {
      teams[index].creatorAvatar = '/images/default-avatar.svg';
      this.setData({ teams, filteredTeams: teams });
    }
  },
// md是你
  // 跳转到发布页
  // goToCreate() {
  //   wx.navigateTo({
  //     url: '/pages/teamCreate/teamCreate'
  //   });
  // }
});
