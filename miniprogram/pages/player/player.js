// miniprogram/pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
// app.js里定义的全局变量
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: "",
    isPlaying: false, //false表示不播放， true表示播放
    isLyricShow: false, //表示当前歌词是否显示
    lyric: '',
    isSame: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync("musiclist")
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicId){
    if(musicId == app.getPlayMusicId()){
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title: music.name
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    
    app.setPlayMusicId(musicId)

    wx.showLoading({
      title: "歌曲加载中..."
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'musicUrl',
        musicId
      }
    }).then((res) => {
      console.log(res)
      let result = JSON.parse(res.result)
      if(result.data[0].url == null){
        wx.showToast({
          title: '无权限播放'
        })
        return
      }
      if(!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        //保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
      
      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc) {
            lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
  togglePlaying(){
    // 正在播放
    if(this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if(nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow(){
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay(){
    this.setData({
      isPlaying: true
    })
  },

  onPause(){
    this.setData({
      isPlaying: false
    })
  },
  // 保存播放历史
  savePlayHistory(){
    // 当前正在播放歌曲对象
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let bHave = false
    for(let i = 0, len = history.length; i < len; i++){
      if(history[i].id == music.id){ //循环//通过循环结果，如果歌曲id不匹配，则不在列表里检查歌曲id是否存在相同 如果存在 就不作为
        bHave = true
        break
      }
    }
    if(!bHave){  //通过循环结果，如果歌曲id不匹配，则不在列表里
      history.unshift(music)  //unshift 在最前面插入一条数据 并返回整个数组
      wx.setStorage({
        key: openid,
        data: history
      })
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})