// 定义mock前缀
const MOCK_BASE_URL = "https://m1.apifoxmock.com/m1/8102999-7859563-default";

function request({url, method="GET", data={}}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: MOCK_BASE_URL + url,
      method,
      data,
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

module.exports = request;
