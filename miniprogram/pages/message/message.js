// pages/message/message.js
const app = getApp();
Page({
  data: {
    content: "",
    messages: [],
    colorDIY: ["#ff7e40", "#ff8700", "#bfae30", "#8742d6", "#37db79", "#fc3f4d", "#9c62d6", "#20805e", "#ffa073", "#35d59d", "#ff4040", "#ff5300", "#769e25"], 
    colorArr: [],
    mesId:""
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
    wx.cloud.callFunction({
      name: "getAllMessages",
      success: res => {
        let mes = res.result.data;
        mes = mes.reverse();
        this.setData({
          messages: mes
        });

        // 背景色：
        let colorArr = this.data.colorArr;
        let diy = this.data.colorDIY;
        for (let i = 0; i < this.data.messages.length; i++) {
          colorArr.push(diy[parseInt(Math.random() * 10 % diy.length)])
        }
        this.setData({
          colorArr
        });
      },
      fail: () => {
        console.log("云函数 getAllMessages 调用失败")
      }
    });
  },
  formateTime(date) {
    let day = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    let time = date.toTimeString().slice(0, 8);
    return day + " " + time;
  },

  onSend() {
    let data = {
      name: app.globalData.userInfo.name,
      avatar:app.globalData.userInfo.avatar,
      content: this.data.content,
      time: this.formateTime(new Date()),
    };
    if (!data.name || !data.content || !data.avatar) {
      wx.showToast({
        title: '留言失败',
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
        let colorArr = this.data.colorArr;
        let diy = this.data.colorDIY;
        colorArr.unshift(diy[parseInt(Math.random() * 10 % diy.length)])
        this.setData({
          colorArr
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
    let index = e.currentTarget.dataset.index;
    if(app.globalData.userInfo.name !== e.currentTarget.dataset.name)  return;
    wx.showModal({
      title: '提示',
      content: '是否删除该留言',
      success: (res) => {
        if (res.confirm) {
          // 确认是当前用户，才可以删除
          wx.cloud.callFunction({
            name: "deleteMessage",
            data: {
              time,
              name:app.globalData.userInfo.name
            },
            success: res => {
              let messages = this.data.messages;
              let colorArr = this.data.colorArr;
              colorArr.splice(index, 1);
              messages.splice(index, 1);
              this.setData({
                messages,
                colorArr
              });
            },
            fail() {
              console.log("云函数 deletemessgae调用失败")
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})