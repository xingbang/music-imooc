// components/musiclist/musiclist.js
// app.js里定义的全局变量
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  pageLifetimes: {
    show() {
      this.setData({
        playingId: parseInt(app.getPlayMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset
      const musicId = ds.musicid
      this.setData({
        playingId: musicId
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicId}&index=${ds.index}`
      })
    }
  }
})
