// pages/history/history.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    histories: [],
    clearAlltag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let his = wx.getStorageSync("trans_his");
    if (!his.length) {
      this.setData({
        clearAlltag: false
      })
    }
    this.setData({
      histories: his
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
  onShow: function() {
    let his = wx.getStorageSync("trans_his");
    if (!his.length) {
      this.setData({
        clearAlltag: false
      })
    } else {
      this.setData({
        clearAlltag: true
      })
    }
    this.setData({
      histories: his
    })
  },
  onDeleteThis(e) {
    console.log(e);
    let his = wx.getStorageSync("trans_his");
    let index = e.currentTarget.dataset.index;
    his.splice(index, 1);
    this.setData({
      histories: his
    });
    wx.setStorageSync('trans_his', his)
    console.log(his);
  },

  onClearHis() {
    this.setData({
      histories: []
    });
    wx.setStorageSync("trans_his", []);
    this.setData({
      clearAlltag: false
    })
  },
  onReview(e) {
    let data = e.currentTarget.dataset.history;
    app.globalData.prevLang = data.prevLang;
    app.globalData.curLang = data.curLang
    console.log(data);
    wx.reLaunch({
      url: `../index/index?query=${data.query}&result=${data.result}`,
    })
  }

})