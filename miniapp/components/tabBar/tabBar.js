// components/tabBar/tabBar.js
Component({
  properties: {
    current: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onTap(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.current) return;
      
      const urls = [
        '/pages/teamRecommend/teamRecommend',
        '/pages/teamCreate/teamCreate',
        '/pages/userProfile/userProfile'
      ];
      
      wx.redirectTo({ url: urls[index] });
    }
  }
});
