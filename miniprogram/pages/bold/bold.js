// pages/bold/bold.js
// 搜索关键字
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,  // 底部弹窗控制
    blogList: []
  },

  // 发布
  onPublish(){
    // 判断用户是否授权
    wx.getSetting({
      success: (res) => {
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: (res) => {
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
  onLoginSuccess(e){
    const detail = e.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`
    })
  },
  onLoginFail(){
    wx.showModal({
      title: '授权才能发布',
      content: ''
    })
  },
  _loadBlogList(start = 0){
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start,
        $url: 'list',
        count: 10
      }
    }).then((res) => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  goCommit(e){
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + e.target.dataset.blogid
    })
  },

  onSearch(e){
    //e.detail.keyword
    this.setData({
      blogList: []
    })
    keyword = e.detail.keyword
    this._loadBlogList(0)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
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
    this.setData({
      blogList: []
    })
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
    }
  }
})