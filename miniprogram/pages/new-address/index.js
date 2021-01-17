// miniprogram/pages/new-address/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    userName: '',
    telNumber: '',
    region: ['广东省', '广州市', '海珠区'],
    detailInfo: ''
  },

  async save(e) {
    // let data = this.data 
    let userName = this.data.userName
    let telNumber = this.data.telNumber
    let detailInfo = this.data.detailInfo
    let region = this.data.region
    let id = this.data.id

    if (!userName || !telNumber || !detailInfo) {
      wx.showModal({
        title: '数据项不能为空',
      })
      return
    }
    if (!/[\d-]{11,18}/.test(telNumber)) {
      wx.showModal({
        title: '电话格式对吗？',
      })
      return
    }
    let data = {
      userName,
      telNumber,
      detailInfo,
      region,
      id
    }
    let method = id ? 'put' : 'post'
    let res = await wx.wxp.request4({
      url: 'http://localhost:3000/user/my/address',
      method,
      data
    })
    if (res.data.msg == 'ok') {
      let opener = this.getOpenerEventChannel()
      let address = this.data
      if (!id) address.id = res.data.data.id
      opener.emit("savedNewAddress", address)
      wx.navigateBack({
        delta: 1,
      })
    } else {
      //在address-model里面,给tel_number字段添加唯一索引
      wx.showToast({
        title: '添加失败，是否电话重复了？',
      })
    }
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let opener = this.getOpenerEventChannel()
    opener.on("editAddress", address => {
      this.setData({
        userName: address.userName,
        telNumber: address.telNumber,
        detailInfo: address.detailInfo,
        region: address.region,
        id: address.id
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})