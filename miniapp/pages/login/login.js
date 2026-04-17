// pages/login/login.js
const request = require('../../utils/request');

Page({
  data: {
    username: '',
    password: ''
  },

  onInputUsername(e) {
    this.setData({ username: e.detail.value });
  },

  onInputPassword(e) {
    this.setData({ password: e.detail.value });
  },

  doLogin() {
    const { username, password } = this.data;
    
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // 模拟登录请求
    request({
      url: '/api/login',
      method: 'POST',
      data: { username, password }
    }).then(res => {
      wx.hideLoading();
      
      if (res.code === 200 || res.success) {
        const userInfo = res.data || { username };
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('token', res.token || 'mock_token');
        
        wx.showToast({ title: '登录成功', icon: 'success' });
        
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
        }, 1000);
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      // 模拟登录成功（无后端时）
      const mockUser = { username, nickname: username, school: '示例大学' };
      wx.setStorageSync('userInfo', mockUser);
      wx.setStorageSync('token', 'mock_token');
      
      wx.showToast({ title: '登录成功（模拟）', icon: 'success' });
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
      }, 1000);
    });
  },

  doRegister() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }
    
    const mockUser = { username, nickname: username };
    wx.setStorageSync('userInfo', mockUser);
    wx.setStorageSync('token', 'mock_token');
    wx.showToast({ title: '注册成功', icon: 'success' });
    
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/teamRecommend/teamRecommend' });
    }, 1000);
  }
});
