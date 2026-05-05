// 定义API基础URL
const BASE_URL = "http://39.103.67.182:8080";

/**
 * 发起 HTTP 请求的封装函数，自动处理认证和统一响应处理
 * @param {Object} options - 请求配置对象
 * @param {string} options.url - 请求的相对路径
 * @param {string} [options.method="GET"] - HTTP 请求方法
 * @param {Object} [options.data={}] - 请求体数据
 * @param {Object} [options.headers={}] - 请求头配置
 * @returns {Promise<Object>} 返回 Promise 对象，成功时解析为响应数据
 * @throws {Error} 当请求失败或 token 无效时抛出错误
 */
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
