// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// 引入API工具
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    activities: [],
    loading: true,
    currentTab: 'hot', // hot: 热门, nearby: 附近
    userLocation: null,
    tabs: [
      { id: 'hot', name: '热门活动' },
      { id: 'nearby', name: '附近活动' }
    ]
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad: function (options) {
    this.loadActivities()
    this.getUserLocation()
  },
  onShow: function() {
    // 页面从后台切换到前台时刷新数据
    if (!this.data.loading) {
      this.loadActivities()
    }
  },
  onPullDownRefresh: function() {
    this.loadActivities()
    wx.stopPullDownRefresh()
  },
  // 加载活动列表
  loadActivities: function() {
    this.setData({ loading: true })
    
    api.getActivities()
      .then(res => {
        if (res && res.data) {
          // 处理活动数据，添加距离信息
          const activities = res.data.map(activity => {
            if (this.data.userLocation && activity.coordinates) {
              const distance = util.calculateDistance(
                this.data.userLocation.latitude,
                this.data.userLocation.longitude,
                activity.coordinates.latitude,
                activity.coordinates.longitude
              )
              activity.distanceText = util.formatDistance(distance)
              activity.distance = distance
            } else {
              activity.distanceText = '未知'
              activity.distance = Infinity
            }
            return activity
          })

          this.setData({ 
            activities: activities,
            loading: false
          })
          
          // 根据当前Tab排序
          this.sortActivities()
        }
      })
      .catch(err => {
        console.error('获取活动列表失败', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取活动失败',
          icon: 'none'
        })
      })
  },
  // 获取用户位置
  getUserLocation: function() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        this.setData({ userLocation: location })
        
        // 重新计算活动距离并排序
        if (this.data.activities.length > 0) {
          this.updateActivitiesDistance()
          this.sortActivities()
        }
      },
      fail: (err) => {
        console.error('获取位置失败', err)
        wx.showToast({
          title: '获取位置失败，请授权位置权限',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 更新活动距离信息
  updateActivitiesDistance: function() {
    if (!this.data.userLocation) return
    
    const activities = this.data.activities.map(activity => {
      if (activity.coordinates) {
        const distance = util.calculateDistance(
          this.data.userLocation.latitude,
          this.data.userLocation.longitude,
          activity.coordinates.latitude,
          activity.coordinates.longitude
        )
        activity.distanceText = util.formatDistance(distance)
        activity.distance = distance
      }
      return activity
    })
    
    this.setData({ activities })
  },
  // 根据当前Tab对活动进行排序
  sortActivities: function() {
    const { currentTab, activities } = this.data
    let sortedActivities = [...activities]
    
    if (currentTab === 'hot') {
      // 热门活动按参与人数排序
      sortedActivities.sort((a, b) => {
        return (b.participants ? b.participants.length : 0) - 
               (a.participants ? a.participants.length : 0)
      })
    } else if (currentTab === 'nearby') {
      // 附近活动按距离排序
      sortedActivities.sort((a, b) => {
        return a.distance - b.distance
      })
    }
    
    this.setData({ activities: sortedActivities })
  },
  // 切换Tab
  switchTab: function(e) {
    const tabId = e.currentTarget.dataset.id
    if (tabId !== this.data.currentTab) {
      this.setData({ currentTab: tabId })
      this.sortActivities()
    }
  },
  // 跳转到活动详情
  navigateToDetail: function(e) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/activityDetail/activityDetail?id=' + activityId
    })
  },
  // 跳转到发布活动页面
  navigateToPublish: function() {
    wx.navigateTo({
      url: '/pages/publishActivity/publishActivity'
    })
  }
})
