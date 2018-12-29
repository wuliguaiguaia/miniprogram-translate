// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database({
  env: "mini2048-263ef7"
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event,context)
  let res = await db.collection("message-trans").add({
    data: {
      name: event.name,
      content: event.content,
      time: event.time,
      avatar: event.avatar
    },
  })
  let id = res._id;
  return db.collection("message-trans").doc(id).get()
}