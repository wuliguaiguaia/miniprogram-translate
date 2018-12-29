// pages/favorite/favorite.js
import FAVORITE from "./../../utils/favorite.js";
import STORAGE from "./../../utils/storage_his.js";
let app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    favorities: [],
    notlikeArr: []
  },

  onLoad: function(options) {
    // 第一次获取 全喜欢
    FAVORITE.getAll().then((list) => {
      this.setData({
        favorities: list,
        notlikeArr: []
      })
    })
  },
  onShow() {
    // 每次都刷新
    this.onLoad();
  },
  onGoIndx(e) {
    // relunch 进入 index
    let data = e.currentTarget.dataset.item;
    app.globalData.prevLang = data.prevLang;
    app.globalData.curLang = data.curLang
    wx.reLaunch({
      url: `../index/index?query=${data.query}&result=${data.result}`,
    })
  },
  // 喜欢
  catchLike(e) {
    console.log("重新喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let data = {
      query: item.query,
      result: item.result,
      prevLang: item.prevLang,
      curLang: item.curLang
    }
    FAVORITE.like(data).then(res => {
      let notlikeArr = this.data.notlikeArr;
      notlikeArr[index] = false;
      this.setData({
        notlikeArr
      });
      STORAGE.isLike_change(data,true)
    })

  },
  // 不喜欢
  catchUnLike(e) {
    console.log("不喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let data = { id: item._id};
    FAVORITE.unLike(data)
    let notlikeArr = this.data.notlikeArr;
    notlikeArr[index] = true;
    this.setData({
      notlikeArr
    });
    STORAGE.isLike_change({query:item.query,curLang:item.curLang},false)
  }
})