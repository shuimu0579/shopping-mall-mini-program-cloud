// 云函数代码
const cloud = require('wx-server-sdk')

const subMchId = '1410138302'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // console.log(event);
  let ip = wxContext.CLIENTIP

  let {body,outTradeNo,totalFee} = event
  // return {ip}
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : body,
    "outTradeNo" : outTradeNo,
    "spbillCreateIp" : ip,
    "subMchId" : subMchId,
    "totalFee" : totalFee,
    "envId": "weapp-ebfl5",//cloud.DYNAMIC_CURRENT_ENV
    "functionName": "pay_cb"
  })
  return res
}