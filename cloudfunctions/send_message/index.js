// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID
  let {desc,page} = event 

  const result = await cloud.openapi.subscribeMessage.send({
    touser: openid,
    page,
    lang: 'zh_CN',
    data: {
      thing7: {
        value: '30天打卡活动'
      },
      thing10: {
        value: `今日开始打卡了:${desc}`
      }
    },
    templateId: 'umED6QCm8NMD3iF5TkchewczDyXCVysqPt14mhEJWkk',
    // developer为开发版；trial为体验版；formal为正式版；默认为正式版
    miniprogramState: 'developer'
  })
return result
}