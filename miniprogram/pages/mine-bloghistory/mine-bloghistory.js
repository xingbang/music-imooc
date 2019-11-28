// pages/mine-bloghistory/mine-bloghistory.js
const MAX_LIMIT = 10
//小程序端初始化云数据库
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  goComment(e){
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogId=' + e.target.dataset.blogid
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListByCloudFn()
  },

  //调用云函数查询数据库
  _getListByCloudFn(){
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getListByOpenid',
        start: this.data.blogList.length,
        count: MAX_LIMIT
      }
    }).then((res) => {
      wx.hideLoading()
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    })
  },

  //从小程序端查询数据库
  _getListByMiniprogram(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    db.collection('blog').skip(this.data.blogList.length).limit(MAX_LIMIT)
    .orderBy('createTime','desc').get()
    .then(res=>{
      let _blogList = res.data;
      for(let i = 0,len=_blogList.length; i <len; i ++){
        _blogList[i].createTime = _blogList[i].createTime.toString()
      }
      this.setData({
        blogList: this.data.blogList.concat(_blogList)
      })
      wx.hideLoading()
    })
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
    this._getListByCloudFn()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    let blog = e.target.dataset.blog
    return {
      title:blog.content,
      path:`/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})