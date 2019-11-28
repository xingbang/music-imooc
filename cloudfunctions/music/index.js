// 云函数入口文件
const cloud = require('wx-server-sdk')

const rp = require('request-promise')

const TcbRouter = require('tcb-router')

const URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('playlist', async(ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })

  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(URL + '/playlist/detail?id=' + parseInt(event.playlistId)).then((res) => {
      return JSON.parse(res)
    })
  })

  app.router('musicUrl', async(ctx, next) => {
    ctx.body = await rp(URL + `/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  app.router('lyric', async(ctx, next) => {
    ctx.body = await rp(URL + `/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  return app.serve()
}