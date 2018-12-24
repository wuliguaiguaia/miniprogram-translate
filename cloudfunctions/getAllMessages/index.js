// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

const db = cloud.database({
  env: "test-263ef7"
});

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("message-trans").get();
}