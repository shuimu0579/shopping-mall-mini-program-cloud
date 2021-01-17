// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const db = cloud.database()
  let res = await db.collection('article')
    .limit(1)
    .orderBy('created_time', 'desc')
    .get()
  
  return res 
}