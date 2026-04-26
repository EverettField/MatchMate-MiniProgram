// app.js
App({
  onLaunch() {
    // 初始化本地数据
    if (!wx.getStorageSync('teams')) {
      wx.setStorageSync('teams', []);
    }
    if (!wx.getStorageSync('applications')) {
      wx.setStorageSync('applications', []);
    }
  },
  //登录

  // wx.login({
  //   success: res => {
  //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //   }
  // }),
  globalData: {
    userInfo: null,
    token: null
  }
})