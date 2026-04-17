// pages/userProfile/userProfile.js
const request = require('../../utils/request');

Page({
  data: {
    avatar: '/images/default-avatar.png',
    nickname: '',
    school: '',
    major: '',
    grade: '',
    gradeIndex: 0,
    grades: ['大一', '大二', '大三', '大四', '研究生'],
    phone: '',
    wechat: '',
    bio: '',
    skills: [
      { name: 'Java', selected: false },
      { name: 'Python', selected: false },
      { name: '前端', selected: false },
      { name: '后端', selected: false },
      { name: 'UI设计', selected: false },
      { name: '产品经理', selected: false },
      { name: '+ 自定义', selected: false }
    ],
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    periods: ['上午', '下午', '晚上'],
    timeSlots: Array(21).fill(false),
    completionPercent: 0
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const skills = this.data.skills.map(item => ({
      ...item,
      selected: Array.isArray(userInfo.skills) ? userInfo.skills.includes(item.name) : false
    }));
    const gradeIndex = this.data.grades.indexOf(userInfo.grade) >= 0 ? this.data.grades.indexOf(userInfo.grade) : 0;
    const timeSlots = Array.isArray(userInfo.timeSlots) && userInfo.timeSlots.length === 21 ? userInfo.timeSlots : Array(21).fill(false);

    this.setData({
      avatar: userInfo.avatar || '/images/default-avatar.png',
      nickname: userInfo.nickname || '',
      school: userInfo.school || '',
      major: userInfo.major || '',
      grade: userInfo.grade || '',
      gradeIndex,
      phone: userInfo.phone || '',
      wechat: userInfo.wechat || '',
      bio: userInfo.bio || '',
      skills,
      timeSlots
    }, () => {
      this.updateCompletion();
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value }, () => {
      this.updateCompletion();
    });
  },

  onGradeChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({
      grade: this.data.grades[index],
      gradeIndex: index
    }, () => {
      this.updateCompletion();
    });
  },

  onToggleSkill(e) {
    const index = e.currentTarget.dataset.index;
    const skills = this.data.skills.slice();
    skills[index].selected = !skills[index].selected;
    this.setData({ skills }, () => {
      this.updateCompletion();
    });
  },

  onToggleSlot(e) {
    const index = e.currentTarget.dataset.index;
    const timeSlots = this.data.timeSlots.slice();
    timeSlots[index] = !timeSlots[index];
    this.setData({ timeSlots }, () => {
      this.updateCompletion();
    });
  },

  updateCompletion() {
    const { nickname, grade, major, wechat, skills, timeSlots } = this.data;
    const items = [
      !!nickname,
      !!grade,
      !!major,
      !!wechat,
      skills.some(item => item.selected),
      timeSlots.some(Boolean)
    ];
    const percent = Math.round(items.filter(Boolean).length / items.length * 100);
    this.setData({ completionPercent: percent });
  },

  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ avatar: tempFilePath });
      }
    });
  },

  onSave() {
    const { nickname, school, major, grade, phone, wechat, bio, skills, timeSlots, avatar } = this.data;

    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!wechat) {
      wx.showToast({ title: '请输入微信号', icon: 'none' });
      return;
    }

    const selectedSkills = skills.filter(item => item.selected).map(item => item.name);

    const userInfo = {
      avatar,
      nickname,
      school,
      major,
      grade,
      phone,
      wechat,
      bio,
      skills: selectedSkills,
      timeSlots
    };

    wx.setStorageSync('userInfo', userInfo);

    request({
      url: '/api/user/update',
      method: 'POST',
      data: userInfo
    }).catch(() => {});

    wx.showToast({ title: '保存成功', icon: 'success' });
  }
});
