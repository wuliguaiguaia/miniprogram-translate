// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

const db = cloud.database({
  env: "mini2048-263ef7"
});

// 云函数入口函数
exports.main = async(event, context) => {
  return db.collection("message-trans").where({
    time: event.time,
    name: event.name
  }).remove();
}