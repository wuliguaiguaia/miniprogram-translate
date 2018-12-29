// pages/history/history.js
import FAVORITE from "./../../utils/favorite.js";
import STORAGE from "./../../utils/storage_his.js";

let app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    histories: [],
    clearAlltag: true,
  },

  onShow: function() {
    let his =STORAGE.get();
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
    let his = this.data.histories;
    let index = e.currentTarget.dataset.index;
    his.splice(index, 1);
    this.setData({
      histories: his
    });
  },


  onClearHis() {
    this.setData({
      histories: []
    });
    this.setData({
      clearAlltag: false
    })
  },

  onReview(e) {
    let data = e.currentTarget.dataset.history;
    app.globalData.prevLang = data.prevLang;
    app.globalData.curLang = data.curLang
    wx.reLaunch({
      url: `../index/index?query=${data.query}&result=${data.result}`,
    })
  },

  // 喜欢
  catchLike(e) {
    console.log("喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let data = {
      query: item.query,
      result: item.result,
      prevLang: item.prevLang,
      curLang: item.curLang
    }
    FAVORITE.like(data).then((res)=>{
      let his = this.data.histories;
      his[index].isLike = true;
      this.setData({
        histories: his
      });
    })
  },
  // 不喜欢
  catchUnLike(e) {
    console.log("不喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let data = {
      query: item.query,
      result: item.result
    };
    FAVORITE.unLike(data).then((res) => {
      let his = this.data.histories;
      his[index].isLike = false;
      this.setData({
        histories: his
      });
    })
  },

  onHide() {
    STORAGE.save(this.data.histories)
    console.log('likai')
  },
  onUnload() {
    this.onHide();
  },

})