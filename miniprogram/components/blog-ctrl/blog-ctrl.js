// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  // 组建使用外部样式
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false, //登录组建是否显示
    modalShow: false,  //底部弹出层是否显示
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      // 判断是否授权
      wx.getSetting({
        success: (res) => {
          if(res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论淡出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginSuccess(e){
      userInfo = e.detail
      // 弹出层消失
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginFail(){
      wx.showModal({
        title: "授权用户才能进行评论",
        content: ""
      })
    },
    onInput(e){
      let content = e.detail.value
      this.setData({
        content
      })
    },
    onSend(e){
      console.log(e)
      //let formId = e.detail.formId
      let content = this.data.content
      if(content.trim() == '') {
        wx.showModal({
          title: "评论内容不能为空",
          content: ""
        })
        return
      }

      // 推送模版消息
      wx.requestSubscribeMessage({
        tmplIds: ['sNV4DndhVtQ2BwTdDKjevNHk-Lg3pEMa0sguEYfkDzk'],
        success: (res) => {
          if(res['sNV4DndhVtQ2BwTdDKjevNHk-Lg3pEMa0sguEYfkDzk'] === 'accept'){
            wx.showToast({
              title: "订阅OK！",
              duration: 1000,
              success: () => {
                //成功
                wx.cloud.callFunction({
                  name: 'sendMsg',
                  data: {
                    content,
                    blogId: this.properties.blogId
                  }
                }).then((res) => {
                  // console.log(res)
                })
              }
            })
          }

          wx.showLoading({
            title: "评论中",
            mask: true
          })
          // 写进云数据库
          db.collection('blog-comment').add({
            data: {
              content,
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              blogId: this.properties.blogId,
              createTime: db.serverDate()
            }
          }).then((res)=> {
            wx.hideLoading()
            wx.showToast({
              title: "评论成功！"
            })
            this.setData({
              modalShow: false,
              content: ''
            })
    
            // 父元素刷新评论页面
            this.triggerEvent('refreshCommentList')
          })
        },
        fail: (err) => {
          console.log(err)
        }
      })
    }
  }
})
