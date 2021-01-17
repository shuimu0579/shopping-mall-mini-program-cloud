Page({
  data: {
    vtabs: [],
    activeTab: 0,
    goodsListMap: {},
    lastIndexForLoadMore: -1,
    loading: true
  },

  async onTapGoods(e) {
    wx.showLoading({
      title: 'Loading..',
    })
    let goodsId = e.currentTarget.dataset.id
    let goods = await wx.wxp.request({
      //10.8.1.117  是本机ip 就是localhost  mac下 ifconfig en0 --> inet 后面就是
      // url: `http://localhost:3000/goods/goods/${goodsId}`, 
      url: `${getApp().wxp.URL_BASE}/goods/goods/${goodsId}`,
    })
    console.log(goods);

    if (goods) {
      goods = goods.data.data
      wx.navigateTo({
        url: `/pages/goods/index?goodsId=${goodsId}`,
        success: function (res) {
          res.eventChannel.emit('goodsData', {
            data: goods
          })
        }
      })
    }
    wx.hideLoading()
  },

  async onLoad() {
    wx.showLoading({
      title: 'Loading..',
    })
    let categoriesData = await wx.wxp.request({
      url: `${getApp().wxp.URL_BASE}/goods/categories`,
    })
    if (categoriesData) {
      categoriesData = categoriesData.data.data;
    }
    // console.log(categoriesData);

    // const titles = ['热搜推荐', '手机数码', '家用电器',
    //   '生鲜果蔬', '酒水饮料', '生活美食', 
    //   '美妆护肤', '个护清洁', '女装内衣', 
    //   '男装内衣', '鞋靴箱包', '运动户外', 
    //   '生活充值', '母婴童装', '玩具乐器', 
    //   '家居建材', '计生情趣', '医药保健', 
    //   '时尚钟表', '珠宝饰品', '礼品鲜花', 
    //   '图书音像', '房产', '电脑办公']
    let vtabs = []
    // const vtabs = categoriesData.map(item => {
    //   this.getGoodsListByCategory(item.id)
    //   return {title: item.category_name, id: item.id}
    // })
    for (let j = 0; j < categoriesData.length; j++) {
      let item = categoriesData[j]
      if (j < 3) this.getGoodsListByCategory(item.id, j)
      // await this.getGoodsListByCategory(item.id)
      vtabs.push({
        title: item.category_name,
        id: item.id
      })
    }
    this.setData({
      vtabs,
      loading: false
    })
    wx.hideLoading()
  },

  onTabCLick(e) {
    const index = e.detail.index
    console.log('tabClick', index)
    this.onCategoryChanged(index)
  },

  onChange(e) {
    const index = e.detail.index
    console.log('change', index)
    this.onCategoryChanged(index)
  },

  onCategoryChanged(index) {
    let cate = this.data.vtabs[index]
    let categoryId = cate.id
    if (!this.data.goodsListMap[categoryId]) {
      this.getGoodsListByCategory(categoryId, index)
    }
  },
  onScrollToIndexLower(e) {
    console.log("scroll to index lower", e.detail);
    let index = e.detail.index;
    // 这是一个多发事件
    if (index != this.data.lastIndexForLoadMore) {
      let cate = this.data.vtabs[index]
      let categoryId = cate.id
      this.getGoodsListByCategory(categoryId, index, true)
      this.data.lastIndexForLoadMore = index
    }
  },

  // 重新计算高度
  reClacChildHeight(index) {
    // calcChildHeight
    const goodsContent = this.selectComponent(`#goods-content${index}`)
    // console.log(goodsContent);

    const categoryVtabs = this.selectComponent('#category-vtabs')
    categoryVtabs.calcChildHeight(goodsContent)
  },

  async getGoodsListByCategory(categoryId, index, loadNextPage = false) {
    console.log(categoryId, index, loadNextPage);

    const pageSize = 5 //每页的数据
    let pageIndex = 1
    let listMap = this.data.goodsListMap[categoryId]
    console.log(listMap);

    if (listMap) {
      console.log(listMap.count);

      // 加载完了，就不要重复加载了
      if (listMap.rows.length >= listMap.count) return
      if (listMap.pageIndex) {
        pageIndex = listMap.pageIndex
        if (loadNextPage) pageIndex++
      }
    }
    let goodsData = await wx.wxp.request({
      url: `${getApp().wxp.URL_BASE}/goods/goods?page_index=${pageIndex}&page_size=${pageSize}&category_id=${categoryId}`,
    })
    if (goodsData) {
      goodsData = goodsData.data.data;
    }
    // console.log(goodsData);
    if (listMap) {
      listMap.pageIndex = pageIndex
      listMap.count = goodsData.count
      listMap.rows.push(...goodsData.rows)
      console.log(listMap);

      this.setData({
        [`goodsListMap[${categoryId}]`]: listMap
      })
    } else {
      goodsData.pageIndex = pageIndex
      this.setData({
        [`goodsListMap[${categoryId}]`]: goodsData
      })
    }

    // this.data.goodsListMap[categoryId] = goodsData
    this.reClacChildHeight(index)
  }

})