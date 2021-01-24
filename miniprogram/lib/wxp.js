import {
  promisifyAll
} from 'miniprogram-api-promise';

// http://localhost:3000
// const URL_BASE = 'http://localhost:3000'
const URL_BASE = 'http://10.8.1.37:3000' //wifi下的动态ip,与手机的wifi相同

const wxp = {
  URL_BASE
}
promisifyAll(wx, wxp)



// compatible usage
// wxp.getSystemInfo({success(res) {console.log(res)}})

// 捕捉错误 
wxp.request2 = function (args) {
  let token = wx.getStorageSync('token')
  if (token) {
    if (!args.header) args.header = {}
    args.header['Authorization'] = `Bearer ${token}`
  }
  if (args.url) args.url = args.url.replace(/^http:\/\/localhost:3000/,URL_BASE)
  return wxp.request(args).catch(function (reason) {
    console.log('reason', reason)
  })
}

// 
wxp.request3 = function(args){
  let token = wx.getStorageSync('token')
  if (!token){
    return new Promise((resolve, reject)=>{
      let pageStack = getCurrentPages()
      if (pageStack && pageStack.length > 0) {
        let currentPage = pageStack[pageStack.length-1]
        currentPage.setData({
          showLoginPanel2:true
        })
        getApp().globalEvent.once("loginSuccess", ()=>{
          wxp.request2(args).then(res=>{
            resolve(res)
          }, err=>{
            console.log('err', err);
            reject(err)
          })
        })
      }else{
        reject('page valid err')
      }
    })
  }
  return wxp.request2(args)
}

// 整合登陆组件
wxp.request4 = function (args) {
  let token = wx.getStorageSync('token')
  
  if (!token) {
    let pages = getCurrentPages()
    let currentPage = pages[pages.length - 1]
    // 展示登陆浮窗
    currentPage.setData({
      showLoginPanel: true
    })
    return new Promise((resolve, reject) => {
      getApp().globalEvent.once('loginSuccess', function (e) {
        wxp.request2(args).then(function (result) {
          resolve(result)
        }).catch(function (reason) {
          console.log('reason', reason);
        })
      })
    })
  }
  return wxp.request2(args).catch(function (reason) {
    console.log('reason', reason);
  })
}

export default wxp