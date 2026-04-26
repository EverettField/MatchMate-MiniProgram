// 定义API基础URL
const BASE_URL = "http://10.64.129.108:8080";

function request({url, method="GET", data={}, headers={}}) {
  return new Promise((resolve, reject) => {
    // 自动添加 Authorization
    const token = wx.getStorageSync('token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: headers,
      success(res) {
        ///////////////////////////
        // 统一处理响应
        const result = res.data;
        
        // 如果返回 401（token无效或过期），清除本地登录状态并跳转登录页
        if (result.code === 401 || result.message === 'token无效' || result.message === '未登录') {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userId');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 2000);
          return reject(new Error('token无效'));
        }
        
        resolve(result);
        ////////////////////////////

      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = request;
