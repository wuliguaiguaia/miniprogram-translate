// pages/change/change.js

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    langList: app.globalData.langList,
    chooseIndex: 0,
    refer: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("cahge", options)
    this.setData({
      chooseIndex: options.query,
      refer: options.refer
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(op) {
    // console.log(op)
  },

  onChooseLang(e) {
    let chooseLang = e.currentTarget.dataset;
    this.setData({
      chooseIndex: chooseLang.index
    });
    if (this.data.refer == "prev") {
      app.globalData.prevLang = chooseLang;
      wx.setStorageSync('trans_prevLang', chooseLang);
      
    } else if (this.data.refer == "cur"){
      app.globalData.curLang = chooseLang;
      wx.setStorageSync('trans_curLang', chooseLang);
    }
    setTimeout(() => {
      wx.switchTab({
        url: './../index/index',
      });
    }, 500)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})