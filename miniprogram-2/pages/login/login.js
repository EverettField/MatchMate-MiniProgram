// pages/login/login.js
const request = require('../../utils/request');

Page({
  data: {
    nickname: '',
    avatar: '',  // 用户选择的微信头像
    isAuthorizing: false,
    canLogin: false  // 是否有有效昵称
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
    }
  },

  // 选择微信头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ 
      avatar: avatarUrl,
      canLogin: this.data.nickname.trim().length > 0
    });
  },

  // 输入昵称
  onInputNickname(e) {
    const nickname = e.detail.value;
    this.setData({ 
      nickname,
      canLogin: nickname.trim().length > 0 && this.data.avatar
    });
  },

  // 昵称输入完成（用于自动填充）
  onNicknameBlur(e) {
    if (!this.data.nickname && e.detail.value) {
      this.setData({ nickname: e.detail.value });
    }
  },

  // 微信授权登录
  onGetUserInfo(e) {
    const userInfo = e.detail.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先同意授权', icon: 'none' });
      return;
    }

    const nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }

    if (this.data.isAuthorizing) return;
    this.setData({ isAuthorizing: true });
    wx.showLoading({ title: '正在登录...' });

    // 优先使用用户选择的微信头像，否则使用授权获取的头像
    const avatar = this.data.avatar || userInfo.avatarUrl || '';

    wx.login({
      success: loginRes => {
        const code = loginRes.code;
        if (!code) {
          wx.hideLoading();
          this.setData({ isAuthorizing: false });
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
          return;
        }

        request({
          url: '/api/login',
          method: 'POST',
          data: { 
            code,
            avatar: avatar,
            nickname: nickname
          }
        }).then(res => {
          wx.hideLoading();
          this.setData({ isAuthorizing: false });

          if (res.code === 0 || res.code === 200) {
            const data = res.data || res;
            
            const savedUser = {
              userId: data.userId,
              nickname: data.nickname || nickname,
              avatar: data.avatar || avatar,
              profileCompleted: data.profileCompleted || false,
              ...data
            };
            
            wx.setStorageSync('userInfo', savedUser);
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('userId', data.userId);
            
            wx.showToast({ title: '登录成功', icon: 'success' });
            
            setTimeout(() => {
              if (data.profileCompleted) {
                wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
              } else {
                wx.reLaunch({ url: '/pages/userProfile/userProfile' });
              }
            }, 800);
          } else {
            wx.showToast({ title: res.msg || '登录失败', icon: 'none' });
          }
        }).catch((err) => {
          console.error('登录请求失败:', err);
          wx.hideLoading();
          this.setData({ isAuthorizing: false });
          wx.showToast({ title: '登录失败，请检查网络', icon: 'none' });
        });
      },
      fail: () => {
        wx.hideLoading();
        this.setData({ isAuthorizing: false });
        wx.showToast({ title: '微信登录失败，请重试', icon: 'none' });
      }
    });
  }
});
