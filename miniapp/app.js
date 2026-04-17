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

  globalData: {
    userInfo: null,
    token: null
  }
})
