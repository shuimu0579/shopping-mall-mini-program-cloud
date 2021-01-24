// 云函数代码
const cloud = require('wx-server-sdk')
const short = require('short-uuid');
const md5Util = require('./md5.js')

// 在下面设置商户号
const mchid = 'e3eb2cda6f1145d290a970c3d8679a85'
// 在下面设置密钥
const secret = '07089d5186e9459699b0a32c3d4762a6'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV //cloud.DYNAMIC_CURRENT_ENV 动态环境id
})

const onGetOpenid = () => {
  // data:传递给云函数的参数，在云函数中可通过 event 参数获取
  // 调用云函数
  cloud.callFunction({
    name: 'login',
    data: {},
    success: res => {
      console.log('user openid: ', res.result.openid)
      return res.result.openid
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败', err)
    }
  })
}

const getRandomNumber = (minNum = 1000000000, maxNum = 99999999999999) => parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
const getSign = obj => {
  /*
   * 签名算法
   * 
   * 由于密钥不应该在小程序内出现，因此生产环境下的小程序不应该包含此参数
   */

  let keys = Object.keys(obj)
  keys.sort()

  let params = []

  keys.forEach(e => {
    if (obj[e] != '') {
      params.push(e + '=' + obj[e])
    }
  })

  params.push('key=' + secret)

  let paramStr = params.join('&')
  let signResult = md5Util.md5(paramStr).toUpperCase()

  return signResult
}
const getOrderParams = (trade) => {
  // 支付参数
  let nonce_str = getRandomNumber() // 随机数
  let goods_detail = ''
  let attach = ''

  let paramsObject = {
    mchid,
    total_fee: trade.total_fee,
    out_trade_no: trade.out_trade_no,
    body: trade.body,
    goods_detail,
    attach,
    notify_url: trade.notify_url,
    nonce_str
  }
  let sign = getSign(paramsObject)
  paramsObject.sign = sign
  return paramsObject
}

exports.main = async (event, ctx) => {
  const wxContext = cloud.getWXContext()
  let ip = wxContext.CLIENTIP
  let {
    totalFee
  } = event

  // 为测试方便，所有金额支付数均为1分
  totalFee = 1
  // 依照Order模型接收参数
  let outTradeNo = `${new Date().getFullYear()}${short().new()}`
  console.log('outTradeNo', outTradeNo);
  // 获取订单的预支付信息
  var trade = {
    // body: goodsNameDesc.substr(0, 127), //最长127字节
    body: '1111', //最长127字节
    out_trade_no: outTradeNo, //
    total_fee: totalFee, //以分为单位，货币的最小金额
    spbill_create_ip: ip,
    notify_url: 'https://rxyk.cn/apis/pay_notify2', // 支付成功通知地址
    trade_type: 'JSAPI',
    // openid: openId
    openid: onGetOpenid()
  };
  let params = getOrderParams(trade)
  console.log('params', params);
  let err = '',
    res,
    result
  // 在这里还没有产生package，因为prepay_id还没有产生
  if (params && params.sign) {
    // 创建记录
    const db = cloud.database()
    let res1 = await db.collection('order').where({
      'out_trade_no': params.out_trade_no
    }).limit(1).get()
    console.log(res1)

    if (!res1.data.length) {
      let res = await db.collection('order').add({
        params
      })
      result = {
        msg: res.errMsg == 'collection.add:ok' ? 'ok' : '',
        data: {
          res,
          params
        }
      }
    }
    if (!res) err = 'db create error'
  } else {
    err = 'error! return null!'
    console.log(err);
  }
  console.log('result...', result)
  return result
}