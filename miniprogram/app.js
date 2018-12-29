//app.js
App({
  onLaunch: function() {
    wx.cloud.init({
      env: 'mini2048-263ef7',
      traceUser: true,
    })
    wx.cloud.callFunction({
      name: "login",
      complete: res => {
        console.log(res)
        this.globalData.userid = res.result.openid;
      },
      fail: () => {
        console.log("云函数 login 调用失败")
      }
    })
    this.globalData.langList[999] = {
      chs: "自动检测",
      index: "999",
      lang: "auto"
    }
    this.globalData.prevLang = wx.getStorageSync("trans_prevLang") || this.globalData.langList[999];
    this.globalData.curLang = wx.getStorageSync("trans_curLang") || this.globalData.langList[0];
    
  },
  globalData: {
    userid: "",
    userInfo: {},
    prevLang: {},
    curLang: {},
    langList: [{
        'chs': '中文',
        "lang": 'zh-CHS',
        "index": 0
      },
      {
        'chs': '英文',
        'lang': 'EN',
        "index": 1
      },
      {
        'chs': '日语',
        'lang': 'ja',
        "index": 2
      },
      {
        'chs': '韩语',
        'lang': 'ko',
        "index": 3
      },
      {
        'chs': '法语',
        'lang': 'fr',
        "index": 4
      },
      {
        'chs': '俄语',
        'lang': 'ru',
        "index": 5
      },
      {
        'chs': '西班牙语',
        'lang': 'es',
        "index": 6
      },
      {
        'chs': '葡萄牙文',
        'lang': 'pt',
        "index": 7
      },
    ]
  }
})