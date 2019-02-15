//index.js
import translate from "./../../utils/textapi.js";
import STORAGE from "./../../utils/storage_his.js";
import FAVORITE from "./../../utils/favorite.js"

const app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    prevLang: {},
    curLang: {},
    animationPrev: {},
    animationCur: {},
    animationClose: {},
    query: "",
    hideCloseIcon: false,
    allTranistion: {},
    result: "",
    isLike: false,
    isSayingPrev1: false,
    isSayingPrev2: false,
    isSayingCur: false,
    confirmFlag: false
  },
  onLoad(options) {
    this.setAppData();

    if (options.query) {
      this.setData({
        query: options.query,
        result: options.result,
      });
    } else {
      this.setData({
        query: wx.getStorageSync("trans_query") || "Hello world"
      })
    }
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
  },
  onCheckFavorite(d) {
    let data = {
      query: d.query,
      result: d.result
    }
    return new Promise((resolve, reject) => {
      FAVORITE.check(data).then((flag) => {
        if (flag) {
          this.setData({
            isLike: true
          })
        } else {
          this.setData({
            isLike: false
          })
        }
        resolve()
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
    let data = {
      query: this.data.query,
      result: this.data.result,
      prevLang: this.data.prevLang,
      curLang: this.data.curLang,
    }
    FAVORITE.like(data).then((res) => {
      wx.showToast({
        title: '收藏成功',
      });
      this.setData({
        isLike: true
      });

      // history
      STORAGE.isLike_change(data,true)

    })
    console.log('喜欢')
  },
  onUnLike() {
    let data = {
      query: this.data.query,
      result: this.data.result,
      curLang:this.data.curLang
    }
    FAVORITE.unLike(data).then((res) => {
      this.setData({
        isLike: false
      });
      STORAGE.isLike_change(data,false)
    })
    console.log('不喜欢')
  },
  onChangeOrigin() {
    [app.globalData.curLang, app.globalData.prevLang] = [app.globalData.prevLang, app.globalData.curLang];
    wx.setStorageSync('trans_prevLang', app.globalData.prevLang);
    wx.setStorageSync('trans_curLang', app.globalData.curLang);
    const animation1 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    });
    const animation2 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    animation1.translateX(65).step();
    animation2.translateX(-65).step();
    this.setData({
      animationPrev: animation1.export(),
      animationCur: animation2.export(),
    });
    setTimeout(() => {
      animation1.translateX(0).step();
      animation2.translateX(0).step();
      this.setData({
        animationPrev: animation1.export(),
        animationCur: animation2.export(),
      });
      this.setData({
        curLang: app.globalData.curLang,
        prevLang: app.globalData.prevLang
      });
    }, 500);


  },
  onChooseCurLang() {
    wx.navigateTo({
      url: `./../change/change?query=${this.data.curLang.index}&refer=cur`,
    });
  },
  onChoosePrevLang() {
    wx.navigateTo({
      url: `./../change/change?query=${this.data.prevLang.index}&refer=prev`,
    })
  },
  onInput(e) {
    this.setData({
      query: e.detail.value,
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
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    });
    animation.rotate(360).step();
    this.setData({
      animationClose: animation.export()
    });
    setTimeout(() => {
      animation.rotate(0).step();
      this.setData({
        animationClose: animation.export()
      });
      this.setData({
        query: "",
        hideCloseIcon: true,
      });
    }, 300)
  },
  onConfirm() {
    if (!this.data.query) {
      return
    };
    let q = this.data.query.trim();
    translate({
      q,
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
      // let cur = app.globalData.langList.find((x) => {
      //   return x.lang == curL
      // });
      let cur = {};
      app.globalData.langList.forEach((x) => {
        if(x.lang == curL){
          cur = x;
          return;
        }
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
      if (q.split(" ").length > 1) {
        explains = [];
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
        },
      })
      // islike
      this.onCheckFavorite({
        query: q,
        result: this.data.result
      }).then(() => {
        // history
        this.historySet()
      });
    }, (err) => {
      console.log(err)
    });
  },
  historySet() {
    let xdata = {
      query: this.data.query.trim(),
      result: this.data.result,
      prevLang: this.data.prevLang,
      curLang: this.data.curLang,
      isLike: this.data.isLike
    }
    STORAGE.confirm_change(xdata);
    wx.setStorageSync('trans_query', xdata.query);

  },
  onGetprevVoice(e) {
    console.log(e.currentTarget.dataset)
    let index = e.currentTarget.dataset.index;
    const audio = wx.createInnerAudioContext()
    audio.src = this.data.allTranistion.speakUrl;
    audio.play()
    audio.onPlay(() => {
      if (index == 1) {
        this.setData({
          isSayingPrev1: true
        });
      } else if (index == 2) {
        this.setData({
          isSayingPrev2: true
        });
      }
      console.log('开始播放')
    })
    audio.onEnded(() => {
      if (index == 1) {
        this.setData({
          isSayingPrev1: false
        });
      } else if (index == 2) {
        this.setData({
          isSayingPrev2: false
        });
      }
      console.log("播放结束")
    })
    audio.onError((res) => {
      console.log(res)
    })
    console.log("onGetprevVoice", this.data.allTranistion.speakUrl)
  },
  onGetcurVoice() {
    const audio = wx.createInnerAudioContext()
    audio.src = this.data.allTranistion.tSpeakUrl;
    audio.play();

    audio.onPlay(() => {
      console.log('开始播放')
      this.setData({
        isSayingCur: true
      })
    })
    audio.onEnded(() => {
      console.log('播放结束')
      this.setData({
        isSayingCur: false
      })
    })
    audio.onError((res) => {
      console.log(res)
    })
    console.log("onGetcurVoice", this.data.allTranistion.tSpeakUrl)
  },
  onCopy() {
    let flag = 1;
    if (!this.data.query) {
      wx.showToast({
        title: '啥都没有',
      })
      flag = 0
    }
    if (flag) {
      wx.setClipboardData({
        data: String(this.data.result),
        success: res => {
          wx.showToast({
            title: '复制成功',
          })
        }
      })
    }
  },
  onHide() {

  },
  onUnload() {

    console.log("leave index")
  },
})