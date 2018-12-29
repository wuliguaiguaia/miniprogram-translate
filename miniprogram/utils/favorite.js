const db = wx.cloud.database();
const app = getApp();

let Favorite = {
  name: "favorite-trans",
  openid: app.globalData.userid,
  like(data) {
    return new Promise((resolve, reject) => {
      db.collection(this.name).add({
        data,
        success: (res) => {
          resolve(res)
        },
        fail() {
          console.log("收藏失败")
        }
      })
    })
  },
  unLike(data) {
    return new Promise((resolve, reject) => {
      if (data.id) {
        db.collection("favorite-trans").doc(data.id).remove();
      } else {
        db.collection(this.name).where({
          _openid: this.openid,
          query: data.query,
          result: data.result
        }).get({
          success: (res) => {
            let id = res.data[0]._id;
            db.collection("favorite-trans").doc(id).remove();
            resolve(res)
          }
        })
      }
    })
  },
  getAll() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "getAllFavorites",
        success: res => {
          let fa = res.result.data;
          fa = fa.reverse();
          resolve(fa)
        },
        fail: () => {
          console.log("云函数 getAllFavorites 调用失败")
        }
      });
    })
  },
  check(data) {
    return new Promise((resolve, reject) => {
      db.collection(this.name).where({
        _openid: this.openid,
        query: data.query,
        result: data.result
      }).get({
        success: (res) => {
          let flag = res.data.length ? true : false;
          resolve(flag)
        },
        fail() {
          console.log("检查是否收藏失败")
        }
      })
    })
  }
}

export default Favorite;