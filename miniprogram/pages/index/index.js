//index.js
import translate from "./../../utils/textapi.js"
const app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    prevLang: {},
    curLang: {},
    query: "hello world",
    hideCloseIcon: false,
    allTranistion: {},
    result: "",
    isLike: false,
  },
  onLoad(options) {
    this.setAppData();
    if (options.query) {
      this.setData({
        query: options.query,
        result: options.result,
      });
    }
    this.onConfirm();
  },
  setAppData() {
    this.setData({
      curLang: app.globalData.curLang,
      prevLang: app.globalData.prevLang,
    });
  },
  onShow() {
    this.setAppData();
    this.onConfirm();
    this.onCheckFavorite();
  },
  onCheckFavorite() {
    return new Promise((resolve, reject) => {
      db.collection("favorite-trans").where({
        _openid: app.globalData.userid,
        query: this.data.query,
        result: this.data.result
      }).get({
        success: (res) => {
          if (res.data.length > 0) {
            console.log("已经收藏了 ！！")
            this.setData({
              isLike: true
            })
            resolve(res.data)
          } else {
            this.setData({
              isLike: false
            })
            reject({
              "favorite_status": false
            })
          }
        },
        fail() {
          console.log("检查是否收藏失败")
        }
      })
    })
  },
  onLike() {
    if (!this.data.query || !this.data.result) {
      wx.showToast({
        title: '啥都没有',
      })
      return;
    }
    db.collection("favorite-trans").add({
      data: {
        query: this.data.query,
        result: this.data.result,
        prevLang: this.data.prevLang,
        curLang: this.data.curLang,
      },
      success: (res) => {
        wx.showToast({
          title: '收藏成功',
        });
        this.setData({
          isLike: true
        })
      },
      fail() {
        console.log("收藏失败")
      }
    })
    console.log('喜欢')
  },
  onUnLike() {
    db.collection("favorite-trans").where({
      _openid: app.globalData.userid,
      query: this.data.query,
      result: this.data.result
    }).get({
      success: (res) => {
        let id = res.data[0]._id;
        db.collection("favorite-trans").doc(id).remove();
        this.setData({
          isLike: false
        })
      }
    })
    console.log('不喜欢')
  },
  onChangeOrigin() {
    [app.globalData.curLang, app.globalData.prevLang] = [app.globalData.prevLang, app.globalData.curLang];
    this.setData({
      curLang: app.globalData.prevLang,
      prevLang: app.globalData.curLang
    });
  },
  onChooseCurLang() {
    wx.navigateTo({
      url: `./../change/change?query=${this.data.curLang.index}&refer=cur`,
    })
  },
  onChoosePrevLang() {
    wx.navigateTo({
      url: `./../change/change?query=${this.data.prevLang.index}&refer=prev`,
    })
  },
  onInput(e) {
    this.setData({
      query: e.detail.value
    });
    if (this.data.query.length) {
      this.setData({
        hideCloseIcon: false
      })
    } else {
      this.setData({
        hideCloseIcon: true
      })
    }
  },
  onTapClose() {
    this.setData({
      query: "",
      hideCloseIcon: true,
    })
  },
  onConfirm() {
    if (!this.data.query) {
      return
    };
    translate({
      q: this.data.query,
      from: app.globalData.prevLang.lang,
      to: app.globalData.curLang.lang
    }).then((data) => {
      let {
        speakUrl,
        tSpeakUrl
      } = data;
      let explains = [],
        phonetic, wfs = null;
      let [prevL, curL] = data.l.split(2)
      let prev = app.globalData.langList.find((x) => {
        return x.lang == prevL
      });
      let cur = app.globalData.langList.find((x) => {
        return x.lang == curL
      });
      if (data.basic) {
        explains = data.basic.explains;
        if (data.basic.phonetic) {
          phonetic = data.basic.phonetic;
        }
        if (data.basic.wfs) {
          wfs = data.basic.wfs
        }
      }
      this.setData({
        result: data.translation,
        allTranistion: {
          speakUrl,
          tSpeakUrl,
          explains,
          phonetic,
          wfs,
          prevChs: prev.chs,
          curChs: cur.chs,
        }
      })

      // history
      let xdata = {
        query: this.data.query,
        result: this.data.result,
        prevLang: this.data.prevLang,
        curLang: this.data.curLang,
      }
      let his = wx.getStorageSync("trans_his") || [];
      let index = his.findIndex((item) => {
        if (item.query === xdata.query) {
          return item.curLang.index === xdata.curLang.index;
        }
      });
      if (index >= 0) {
        his.splice(index, 1)
      }
      his.unshift(xdata);
      wx.setStorageSync("trans_his", his);

    }, (err) => {
      console.log(err)
    });

    // showStar 应该放在 success
    db.collection("favorite-trans").where({
      _openid: app.globalData.userid,
      query: this.data.query,
      result: this.data.result,
    }).get({
      success: (res) => {
        if (res.data.lenght > 0) {
          console.log(res, '已经收藏了');
          this.setData({
            isLike: true
          })
        } else {
          this.setData({
            isLike: false
          })
        }
      },
      fail: (res) => {
        console.log('x')
      }
    })
  },
  onGetprevVoice() {
    const audio = wx.createInnerAudioContext()
    audio.src = this.data.allTranistion.speakUrl;
    audio.play()
    audio.onPlay(() => {
      console.log('开始播放')
    })
    audio.onError((res) => {
      console.log(res)
    })
    console.log("onGetprevVoice", this.data.allTranistion.speakUrl)
  },
  onGetcurVoice() {
    const audio = wx.createInnerAudioContext()
    audio.src = this.data.allTranistion.tSpeakUrl;
    audio.play()

    audio.onPlay(() => {
      console.log('开始播放')
    })
    audio.onError((res) => {
      console.log(res)
    })
    console.log("onGetcurVoice", this.data.allTranistion.tSpeakUrl)
  },
  onCopy() {
    if (!this.data.query) {
      wx.showToast({
        title: '啥都没有',
      })
      return
    }
    if (!this.data.result) {
      wx.showModal({
        title: '有内容吗你复制',
        content: '确认翻译会吗',
        success: (res) => {
          if (res.confirm) {
            this.onConfirm();
            wx.showToast({
              title: '这就对了',
            })
          }
        }
      })
      return;
    }
    console.log(typeof this.data.result)
    wx.setClipboardData({
      data: String(this.data.result),
      success: res => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  }
})