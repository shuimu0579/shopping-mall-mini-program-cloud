// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
// 返回记录_id
exports.main = async (event, context) => {
  let result = {}
  let data = event 
  const wXContext = cloud.getWXContext()
  let openid = wXContext.OPENID
  data.openid = openid

  console.log(data,openid);

  const db = cloud.database()
  
  let res1 = await db.collection('user').where({
    'openid':openid
  }).limit(1).get()

  // console.log('res1',res1.data.length);
  
  if (!res1.data.length){
    // {_id: "8ac0e22b5fcdd0fb0006881f232f7ce7", errMsg: "collection.add:ok"}
    let res = await db.collection('user').add({
      data
    })
    result = {
      msg:res.errMsg == 'collection.add:ok'? 'ok':'',
      _id:res._id
    }
  }else{
    // {errMsg: "document.update:ok",stats: {updated: 0}}
    let res = await db.collection('user').doc(res1.data[0]._id).update({
      data
    })    
    result = {
      msg:res.errMsg == 'document.update:ok'? 'ok':'',
      _id:res1.data[0]._id
    }
  }
  // console.log('result',result);

  return result 
}