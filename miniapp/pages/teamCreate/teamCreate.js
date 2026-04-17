// pages/teamCreate/teamCreate.js
const request = require('../../utils/request');

Page({
  data: {
    recruitTitle: '',
    projectName: '',
    projectDescription: '',
    skills: [
      { name: 'Java', selected: false },
      { name: 'Python', selected: false },
      { name: '前端', selected: false },
      { name: '后端', selected: false },
      { name: 'UI设计', selected: false },
      { name: '产品经理', selected: false },
      { name: '+ 自定义', selected: false }
    ],
    needNum: 3,
    minNum: 1,
    maxNum: 20,
    contact: '',
    showCustomSkillModal: false,
    customSkillInput: ''
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
    if (skills[index].name === '+ 自定义') {
      this.setData({ showCustomSkillModal: true, customSkillInput: '' });
      return;
    }
    skills[index].selected = !skills[index].selected;
    this.setData({ skills });
  },

  onCustomSkillInput(e) {
    this.setData({ customSkillInput: e.detail.value });
  },

  onConfirmCustomSkill() {
    const value = (this.data.customSkillInput || '').trim();
    if (!value) {
      wx.showToast({ title: '请输入自定义技能', icon: 'none' });
      return;
    }

    const skills = this.data.skills.slice();
    const existIndex = skills.findIndex(item => item.name === value);
    if (existIndex >= 0) {
      skills[existIndex].selected = true;
    } else {
      const insertIndex = skills.findIndex(item => item.name === '+ 自定义');
      if (insertIndex >= 0) {
        skills.splice(insertIndex, 0, { name: value, selected: true });
      } else {
        skills.push({ name: value, selected: true });
      }
    }

    this.setData({ skills, showCustomSkillModal: false, customSkillInput: '' });
  },

  onCancelCustomSkill() {
    this.setData({ showCustomSkillModal: false, customSkillInput: '' });
  },

  noop() {},

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
    const { recruitTitle, projectName, projectDescription, contact, needNum, skills } = this.data;
    const userInfo = wx.getStorageSync('userInfo') || {};
    const selectedSkills = skills.filter(item => item.selected).map(item => item.name);

    if (!recruitTitle) {
      wx.showToast({ title: '请输入招募标题', icon: 'none' });
      return;
    }

    if (!projectName) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }

    if (!projectDescription) {
      wx.showToast({ title: '请输入项目描述', icon: 'none' });
      return;
    }

    if (!contact) {
      wx.showToast({ title: '请输入联系方式', icon: 'none' });
      return;
    }

    const teamData = {
      title: recruitTitle,
      projectName,
      description: projectDescription,
      skills: selectedSkills,
      needNum,
      contact,
      category: '组队招募',
      creator: userInfo.nickname || userInfo.username || '匿名用户',
      creatorId: userInfo.username || 'unknown',
      school: userInfo.school || '',
      createTime: new Date().toISOString(),
      status: '招募中'
    };

    wx.showLoading({ title: '发布中...' });

    const teams = wx.getStorageSync('teams') || [];
    teamData.id = Date.now().toString();
    teams.unshift(teamData);
    wx.setStorageSync('teams', teams);

    request({
      url: '/api/team/create',
      method: 'POST',
      data: teamData
    }).catch(() => {});

    wx.hideLoading();
    wx.showToast({ title: '发布成功', icon: 'success' });

    setTimeout(() => {
      wx.navigateTo({ url: '/pages/teamRecommend/teamRecommend' });
    }, 1500);
  }
});
