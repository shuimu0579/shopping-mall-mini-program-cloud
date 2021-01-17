// componenets/xunhupay/xunhupay.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    params: { // 支付订单参数
      type: Object,
      value: null
    },
    envVersion: {
      type: String,
      value: "release"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showPayModal: false,
    paying: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setPaying(newPayingData) {
      this.setData({
        paying: newPayingData
      })
      this.triggerEvent('dataChange', { paying: newPayingData })
    },
    onTapCancel () {
      // 用户点击了支付组件外的地方（灰色地方）
      console.log(' 跳转到 xunhupay 小程序失败 - 用户点击了提醒窗体以外的地方')
      this.triggerEvent('fail', { navigateSuccess: false })
      this.triggerEvent('complete')
    },
    navigateSuccess () {
      console.log(' 跳转到 xunhupay 小程序成功')
      // 成功跳转：标记支付中状态
      this.setPaying(true)
    },
    navigateFail (e) {
      // 跳转失败
      console.log(' 跳转到 xunhupay 小程序失败 - 失败回调', e)
      this.triggerEvent('fail', { navigateSuccess: false, info: e })
      this.triggerEvent('complete')
    }
  },

  /** 
   * 组件生命周期
   */
  lifetimes: {
    // 组件显示时，自动触发小程序跳转
    attached() {
      this.setPaying(false)
      if (!this.data.params) {
        console.error(' 跳转到 xunhupay 小程序失败 - 错误：没有传递跳转参数', r)
        this.triggerEvent('fail', { error: true, navigateSuccess: false })
        this.triggerEvent('complete')
      }

      // 监听 app.onShow 事件
      wx.onAppShow(appOptions => {
        if (!this.data.paying) return;

        // 恢复支付前状态
        this.setPaying(false)
        
        if (appOptions.scene === 1038 && appOptions.referrerInfo.appId === 'wx2574b5c5ee8da56b') {
          // 来源于 xunhupay 小程序返回
          console.log('确认来源于 xunhupay 回调返回', appOptions)
          let extraData = appOptions.referrerInfo.extraData

          // if (extraData.success) { 这个地方demo中有错误，字段已经更改了，但是代码没有更新
          if (extraData.paySuccess) {
            this.triggerEvent('success', { navigateSuccess: true, info: extraData })
            this.triggerEvent('complete')
          } else {
            this.triggerEvent('fail', { navigateSuccess: true, info: extraData })
            this.triggerEvent('complete')
          }
        }
      })

      // 尝试直接跳转到 xunhupay 发起小程序支付
      wx.navigateToMiniProgram({
        appId: 'wx2574b5c5ee8da56b',
        path: 'pages/cashier/cashier',
        extraData: this.data.params,
        envVersion: this.data.envVersion,
        success: r => {
          console.log('跳转到 xunhupay 小程序成功', r)
          // 成功跳转：标记支付中状态
          this.setPaying(true)
        },
        fail: e => {
          // 跳转失败：弹出提示组件引导用户跳转
          console.log('跳转到 xunhupay 小程序失败 - 准备弹窗提醒跳转', e)
          this.setData({
            showPayModal: true
          })
        }
      })
    }
  }
})
