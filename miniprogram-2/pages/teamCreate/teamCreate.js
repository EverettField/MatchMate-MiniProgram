// pages/teamCreate/teamCreate.js
const request = require('../../utils/request');

Page({
  data: {
    type: 'contest',  // 默认竞赛类型
    recruitTitle: '',
    projectName: '',
    projectDescription: '',
    skills: [
      { name: 'Java', selected: false },
      { name: 'Python', selected: false },
      { name: '前端', selected: false },
      { name: '后端', selected: false },
      { name: 'UI设计', selected: false },
      { name: '产品经理', selected: false }
    ],
    needNum: 3,
    minNum: 1,
    maxNum: 6,  // API要求1-6人
    contact: ''
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      contact: userInfo.wechat || userInfo.phone || ''
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onToggleSkill(e) {
    const index = e.currentTarget.dataset.index;
    const skills = this.data.skills.slice();
    skills[index].selected = !skills[index].selected;
    this.setData({ skills });
  },

  onSelectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type });
  },

  onAdjustNum(e) {
    const type = e.currentTarget.dataset.type;
    let needNum = this.data.needNum;
    if (type === 'sub' && needNum > this.data.minNum) {
      needNum -= 1;
    }
    if (type === 'add' && needNum < this.data.maxNum) {
      needNum += 1;
    }
    this.setData({ needNum });
  },

  onClose() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage.route === 'pages/teamRecommend/teamRecommend') {
        wx.navigateBack();
        return;
      }
    }
    wx.redirectTo({
      url: '/pages/teamRecommend/teamRecommend'
    });
  },

  onSubmit() {
    const { type, recruitTitle, projectName, projectDescription, contact, needNum, skills } = this.data;
    const userInfo = wx.getStorageSync('userInfo') || {};
    const selectedSkills = skills.filter(item => item.selected).map(item => item.name);

    // 登录状态校验
    if (!wx.getStorageSync('token')) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再发布组队',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }

    if (!recruitTitle) {
      wx.showToast({ title: '请输入招募标题', icon: 'none' });
      return;
    }

    if (recruitTitle.length > 50) {
      wx.showToast({ title: '标题最多50字符', icon: 'none' });
      return;
    }

    if (!projectDescription) {
      wx.showToast({ title: '请输入项目描述', icon: 'none' });
      return;
    }

    if (projectDescription.length < 10 || projectDescription.length > 500) {
      wx.showToast({ title: '描述10-500字符', icon: 'none' });
      return;
    }

    if (selectedSkills.length === 0) {
      wx.showToast({ title: '请选择至少一个技能', icon: 'none' });
      return;
    }

    if (selectedSkills.length > 6) {
      wx.showToast({ title: '最多选择6个技能', icon: 'none' });
      return;
    }

    if (!contact) {
      wx.showToast({ title: '请输入联系方式', icon: 'none' });
      return;
    }

    if (contact.length > 50) {
      wx.showToast({ title: '联系方式最多50字符', icon: 'none' });
      return;
    }

    // API 请求数据（符合API文档字段要求）
    const apiData = {
      type,
      title: recruitTitle,
      description: projectDescription,
      requiredSkills: selectedSkills,
      neededCount: needNum,
      contact
    };

    // 本地存储数据
    const teamData = {
      ...apiData,
      projectName,
      tags: selectedSkills,
      category: type === 'contest' ? '竞赛组队' : '课业组队',
      creator: userInfo.nickname || '匿名用户',
      creatorId: wx.getStorageSync('userId') || userInfo.userId || 'unknown',
      creatorAvatar: userInfo.avatar || '',
      school: userInfo.school || '',
      createTime: new Date().toISOString(),
      status: '招募中'
    };

    wx.showLoading({ title: '发布中...' });

    // 调用API（Authorization已由request自动添加）
    request({
      url: '/api/team/create',
      method: 'POST',
      data: apiData
    }).then((res) => {
      wx.hideLoading();
      
      // 只有 API 返回成功才保存到本地
      if (res.code === 200) {
        const teams = wx.getStorageSync('teams') || [];
        teamData.id = res.data?.teamId || Date.now().toString();
        teams.unshift(teamData);
        wx.setStorageSync('teams', teams);
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    }).catch((err) => {
      console.error('发布组队失败:', err);
      wx.hideLoading();
      
      if (err.status === 401) {
        wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/login/login' });
        }, 1500);
      } else {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  }
});
