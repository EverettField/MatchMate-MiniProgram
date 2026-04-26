// pages/userProfile/userProfile.js
const request = require('../../utils/request');

Page({
  data: {
    avatar: '/images/default-avatar.svg',
    nickname: '',
    school: '河南农业大学',
    major: '软件工程',
    grade: '大一',
    gradeIndex: 0,
    majorIndex: 0,
    gradeOptions: ['大一', '大二', '大三', '大四'],
    majorOptions: ['软件工程', '数据科学与大数据技术'],
    phone: '',
    wechat: '',
    bio: '',
    skills: [{
        name: 'Java',
        selected: false
      },
      {
        name: 'Python',
        selected: false
      },
      {
        name: '前端',
        selected: false
      },
      {
        name: '后端',
        selected: false
      },
      {
        name: 'UI设计',
        selected: false
      },
      {
        name: '产品经理',
        selected: false
      }
    ],
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    periods: ['上午', '下午', '晚上'],
    timeSlots: Array(21).fill(false),
    isDayFull: Array(7).fill(false),
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
    const timeSlots = Array.isArray(userInfo.timeSlots) && userInfo.timeSlots.length === 21 ? userInfo.timeSlots : Array(21).fill(false);

    const gradeIndex = this.data.gradeOptions.indexOf(userInfo.grade) !== -1 ? this.data.gradeOptions.indexOf(userInfo.grade) : 0;
    const majorIndex = this.data.majorOptions.indexOf(userInfo.major) !== -1 ? this.data.majorOptions.indexOf(userInfo.major) : 0;

    this.setData({
      avatar: userInfo.avatar || '/images/default-avatar.svg',
      nickname: userInfo.nickname || '',
      school: userInfo.school || this.data.school, // 优先读取存储，没有则用默认值
      major: userInfo.major || this.data.major,
      grade: userInfo.grade || this.data.grade,
      gradeIndex,
      majorIndex,
      phone: userInfo.phone || '',
      wechat: userInfo.wechat || '',
      bio: userInfo.bio || '',
      skills,
      timeSlots
    }, () => {
      this.updateCompletion();
      this.updateDayFullStatus();
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    }, () => {
      this.updateCompletion();
    });
  },

  onGradeChange(e) {
    const index = e.detail.value;
    this.setData({
      grade: this.data.gradeOptions[index],
      gradeIndex: index
    }, () => {
      this.updateCompletion();
    });
  },

  onMajorChange(e) {
    const index = e.detail.value;
    this.setData({
      major: this.data.majorOptions[index],
      majorIndex: index
    }, () => {
      this.updateCompletion();
    });
  },

  onToggleSkill(e) {
    const index = e.currentTarget.dataset.index;
    const skills = this.data.skills.slice();
    skills[index].selected = !skills[index].selected;
    this.setData({
      skills
    }, () => {
      this.updateCompletion();
      this.updateDayFullStatus();
    });
  },

  onToggleSlot(e) {
    const index = e.currentTarget.dataset.index;
    const timeSlots = this.data.timeSlots.slice();
    timeSlots[index] = !timeSlots[index];
    this.setData({
      timeSlots
    }, () => {
      this.updateCompletion();
      this.updateDayFullStatus();
    });
  },

  // 点击周几标题，切换该列所有时间段
  onToggleDay(e) {
    const dayIndex = e.currentTarget.dataset.day;
    const timeSlots = this.data.timeSlots.slice();
    // 该列的三个时间段索引: 上午(dayIndex), 下午(dayIndex+7), 晚上(dayIndex+14)
    const slots = [dayIndex, dayIndex + 7, dayIndex + 14];
    // 判断当前该列是否全绿，如果全绿则取消，否则全部设为绿
    const isAllActive = slots.every(i => timeSlots[i]);
    slots.forEach(i => {
      timeSlots[i] = !isAllActive;
    });
    this.setData({
      timeSlots
    }, () => {
      this.updateCompletion();
      this.updateDayFullStatus();
    });
  },

  // 更新某天是否全满的状态
  updateDayFullStatus() {
    const {
      timeSlots
    } = this.data;
    const isDayFull = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
      const slots = [dayIndex, dayIndex + 7, dayIndex + 14];
      return slots.every(i => timeSlots[i]);
    });
    this.setData({
      isDayFull
    });
  },

  updateCompletion() {
    const {
      nickname,
      major,
      grade,
      skills,
      timeSlots
    } = this.data;
    const items = [
      !!nickname,
      !!grade,
      !!major,

      skills.some(item => item.selected),
      timeSlots.some(Boolean)
    ];
    const percent = Math.round(items.filter(Boolean).length / items.length * 100);
    this.setData({
      completionPercent: percent
    });
  },

  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          avatar: tempFilePath
        });
      }
    });
  },

  onSave() {
    const {
      nickname,
      school,
      major,
      grade,
      phone,
      wechat,
      bio,
      skills,
      timeSlots,
      avatar
    } = this.data;

    if (!nickname || !nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    // 获取登录时保存的关键字段，保存时保留
    const storedUserInfo = wx.getStorageSync('userInfo') || {};
    const selectedSkills = skills.filter(item => item.selected).map(item => item.name);

    // 完整用户信息保存到本地
    const userInfo = {
      ...storedUserInfo,
      avatar,
      nickname: nickname.trim(),
      school,
      major,
      grade,
      phone,
      wechat: wechat.trim(),
      bio,
      skills: selectedSkills,
      timeSlots,
      profileCompleted: true,
      updateTime: new Date().toISOString()
    };

    wx.setStorageSync('userInfo', userInfo);

    // 调用API保存用户资料
    const token = storedUserInfo.token;
    if (token) {
      wx.showLoading({
        title: '保存中...'
      });

      request({
        url: '/api/user/profile',
        method: 'POST',
        data: {
          nickname: nickname.trim(),
          grade,
          major,
          skills: selectedSkills
        }
      }).then((res) => {
        wx.hideLoading();
        if (res.code === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/teamRecommend/teamRecommend'
            });
          }, 1000);
        } else {
          wx.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          });
        }
      }).catch((err) => {
        wx.hideLoading();
        console.error('保存用户资料失败:', err);
        if (err.status === 401) {
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/teamRecommend/teamRecommend'
        });
      }, 1000);
    }
  },

  // 跳转我的组队页面
  goToMyTeams() {
    wx.navigateTo({
      url: '/pages/myTeams/myTeams'
    });
  }
});