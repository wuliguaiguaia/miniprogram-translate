// pages/favorite/favorite.js
let app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    favorities: [],
    notlikeArr:{}
  },

  onLoad: function(options) {
    // 第一次获取 全喜欢
    db.collection("favorite-trans").where({
      _openid: app.globalData.userid
    }).get({
      success: (res) => {
        let list = res.data.reverse();
        this.setData({
          favorities: list,
          notlikeArr:[]
        })
        console.log("favorite load", this.data.notlikeArr)
      },
      fail() {
        console.log("获取收藏列表失败")
      }
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
    console.log(data);
    wx.reLaunch({
      url: `../index/index?query=${data.query}&result=${data.result}`,
    })
  },
  // 喜欢
  catchLike(e) {
    console.log("重新喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    db.collection("favorite-trans").add({
      data: {
        query: item.query,
        result: item.result,
        prevLang: item.prevLang,
        curLang: item.curLang
      },
      success: () => {
        let notlikeArr = this.data.notlikeArr;
        notlikeArr[index] = false;
        this.setData({
          notlikeArr 
        })
        console.log("yes")
      }
    });

  },
  // 不喜欢
  catchUnLike(e) {
    console.log("不喜欢")
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    let id = item._id;
    db.collection("favorite-trans").doc(id).remove();
    let notlikeArr = this.data.notlikeArr;
    notlikeArr[index] = true;
    this.setData({
      notlikeArr
    })
    console.log("this.data.notlikeArr[0]",this.data.notlikeArr[0])
  }
})