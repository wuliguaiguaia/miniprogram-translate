import FAVORITE from "./favorite.js"

let Storage = {
  key:"trans_his",
  save(data){
    wx.setStorageSync(this.key,data);
  },
  get(){
    return wx.getStorageSync(this.key) || [];
  },
  findIndex(data){
    let his = this.get();
    console.log('data',data)
    let index =  his.findIndex((item)=>{
      if(data.query === item.query){
        return data.curLang.index === item.curLang.index;
      }
    });
    return index;
  },
  confirm_change(data){
    let his = this.get();
    let index = this.findIndex(data);
    if(index >= 0){
      his.splice(index,1);
    }
    his.unshift(data);
    this.save(his);
  },
  isLike_change(data,isLike){
    let his = this.get();
    let index = this.findIndex(data);
    his[index].isLike = isLike;
    this.save(his);
  }
}

export default Storage;