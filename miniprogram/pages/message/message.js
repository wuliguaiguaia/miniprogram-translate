// pages/message/message.js
const app = getApp();
Page({
  data: {
    content: "",
    messages: [],
    userInfo: {},
    colorArr: ["#ff7e40","#ff8700", "#bfae30","#8742d6","#37db79","#fc3f4d", "#9c62d6", "#20805e","#ffa073","#35d59d","#ff4040","#ff5300","#b9f73e"],
  },
  bindContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    wx.cloud.callFunction({
      name: "getAllMessages",
      success: res => {
        let mes = res.result.data;
        mes = mes.reverse();
        this.setData({
          messages: mes
        });


        // 背景色：
        let color = this.data.colorArr;
        color.sort((x) => {
          return Math.random() > 0.5 ? 1 : -1;
        })
        let n = this.data.messages.length - color.length;
        console.log(n);
        for (let i = 0; i < n; i++) {
          color.unshift(color[parseInt(Math.random() * 10 % color.length)])
        }
        this.setData({
          colorArr:color
        });
      },
      fail: () => {
        console.log("云函数 getAllMessages 调用失败")
      }
    });
  },

  formateTime(data) {
    let day = data.toLocaleDateString();
    let time = data.toTimeString().slice(0, 8);
    return day + " " + time
  },

  onSend() {
    let data = {
      name: this.data.userInfo.name,
      content: this.data.content,
      time: this.formateTime(new Date()),
      avatar: this.data.userInfo.avatar
    };
    if (!data.name || !data.content || !data.avatar) {
      wx.showToast({
        title: '留言失败，请检查网络',
      })
      return;
    }

    wx.cloud.callFunction({
      name: "addMessages",
      data,
      success: res => {
        let mes = this.data.messages;
        console.log(res)
        mes.unshift(res.result.data);
        this.setData({
          messages: mes
        });
        wx.showToast({
          title: '留言成功',
        });
        this.setData({
          content: ""
        })
        // 背景颜色
        let color = this.data.colorArr;
        color.unshift(color[parseInt(Math.random() * 10 % color.length)])
        this.setData({
          colorArr: color
        })
      },
      fail() {
        console.log("云函数 addMessages 调用失败")
      }
    })
  },

  // 删除留言
  onDeleteMes(e) {
    let time = e.currentTarget.dataset.time;
    // 确认是当前用户，才可以删除
    wx.cloud.callFunction({
      name: "deleteMessage",
      data: {
        time
      },
      success: res => {
        console.log(res)
      },
      fail() {
        console.log("云函数 deletemessgae调用失败")
      }
    })
    // get({
    // success:(res) => {
    // res.data 是包含以上定义的两条记录的数组
    // console.log(res.data)
    let mes = this.data.messages;
    let index = mes.findIndex((item) => {
      return item.time === time
    })
    wx.showModal({
      title: '提示',
      content: '是否删除该留言',
      success: (res) => {
        if (res.confirm) {
          mes.splice(index, 1);
          this.setData({
            messages: mes
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    // }
    // })
  }
})