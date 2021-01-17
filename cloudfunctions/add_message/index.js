// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  // normal 
  // db.collection('message').add({
  //   data: {
  //     room: '100000',
  //     user: 'weapp',
  //     text: 'message' + new Date().toLocaleTimeString()
  //   }
  // })

  // 开始事务
  const transaction = await db.startTransaction()
  await transaction.collection('message').add({
    data: {
      room: '100000',
      user: 'weapp',
      text: 'message-cloud' + new Date().toLocaleTimeString
    }
  })
  await transaction.commit()
  // await transaction.rollback()
}