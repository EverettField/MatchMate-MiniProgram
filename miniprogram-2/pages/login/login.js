// pages/login/login.js
const request = require('../../utils/request');

Page({
  data: {
    nickname: '',
    isAuthorizing: false,
    canLogin: false  // 是否有有效昵称
  },

  /**
 * 页面加载时检查用户登录状态
 * 如果检测到已登录（存在用户信息和token），则重定向到推荐组队页面
 * 无参数
 * 无返回值
 */
  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      // 已登录，跳转到首页
      wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
    }
  },

  // 输入用户名
  onInputNickname(e) {
    const nickname = e.detail.value;
    this.setData({ 
      nickname,
      canLogin: nickname.trim().length > 0
    });
  },

  // 微信授权登录
  onGetUserInfo(e) {
    const userInfo = e.detail.userInfo;
    if (!userInfo) {
      wx.showToast({ title: '请先同意授权', icon: 'none' });
      return;
    }

    // 必须输入昵称才能登录
    const nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }

    if (this.data.isAuthorizing) return;
    this.setData({ isAuthorizing: true });
    wx.showLoading({ title: '正在登录...' });

    const avatar = userInfo.avatarUrl || '';

    // 步骤1: 调用 wx.login 获取 code
    wx.login({
      success: loginRes => {
        const code = loginRes.code;
        if (!code) {
          wx.hideLoading();
          this.setData({ isAuthorizing: false });
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
          return;
        }

        // 步骤2-5: 发送 code 到后端，换取 userId、创建/查找用户、获取 token
        console.log('准备登录，请求数据:', { code });
        request({
          url: '/api/login',
          method: 'POST',
          data: { code }
        }).then(res => {
          wx.hideLoading();
          this.setData({ isAuthorizing: false });

          if (res.code === 0 || res.code === 200) {
            const data = res.data || res;
            
            // 保存用户信息和 token
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
