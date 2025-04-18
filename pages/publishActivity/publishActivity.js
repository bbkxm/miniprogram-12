// 引入API和工具
const api = require('../../utils/api.js')
const util = require('../../utils/util.js')

Page({
  data: {
    formData: {
      title: '',
      description: '',
      coverImage: '',
      startTime: '',
      endTime: '',
      location: '',
      coordinates: null,
      checkpoints: []
    },
    submitting: false,
    showDatePicker: false,
    datePickerType: '', // 'start' or 'end'
    currentStep: 0,
    steps: ['基本信息', '打卡点设置'],
    tempCheckpoint: {
      name: '',
      coordinates: null
    }
  },

  onLoad: function (options) {
    // 初始化日期
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    
    this.setData({
      'formData.startTime': util.formatDate(today) + ' 08:00',
      'formData.endTime': util.formatDate(tomorrow) + ' 18:00'
    })
  },

  // 输入标题
  onInputTitle: function(e) {
    this.setData({ 'formData.title': e.detail.value })
  },

  // 输入描述
  onInputDescription: function(e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  // 选择封面图片
  chooseCoverImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ 'formData.coverImage': res.tempFilePaths[0] })
      }
    })
  },

  // 显示日期选择器
  showDatePicker: function(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 
      showDatePicker: true,
      datePickerType: type
    })
  },

  // 日期选择器确认
  onDatePickerConfirm: function(e) {
    const value = e.detail.value
    
    if (this.data.datePickerType === 'start') {
      this.setData({ 
        'formData.startTime': value,
        showDatePicker: false
      })
    } else if (this.data.datePickerType === 'end') {
      this.setData({ 
        'formData.endTime': value,
        showDatePicker: false
      })
    }
  },

  // 日期选择器取消
  onDatePickerCancel: function() {
    this.setData({ showDatePicker: false })
  },

  // 选择活动地点
  chooseLocation: function() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location': res.name || res.address,
          'formData.coordinates': {
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
      }
    })
  },

  // 添加打卡点
  addCheckpoint: function() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'tempCheckpoint.name': res.name || '打卡点' + (this.data.formData.checkpoints.length + 1),
          'tempCheckpoint.coordinates': {
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
        
        this.confirmAddCheckpoint()
      }
    })
  },

  // 输入打卡点名称
  onInputCheckpointName: function(e) {
    this.setData({ 'tempCheckpoint.name': e.detail.value })
  },

  // 确认添加打卡点
  confirmAddCheckpoint: function() {
    const { tempCheckpoint, formData } = this.data
    
    // 验证
    if (!tempCheckpoint.name || !tempCheckpoint.coordinates) {
      wx.showToast({
        title: '请填写完整的打卡点信息',
        icon: 'none'
      })
      return
    }
    
    // 添加打卡点
    const newCheckpoint = {
      id: formData.checkpoints.length + 1,
      name: tempCheckpoint.name,
      coordinates: tempCheckpoint.coordinates
    }
    
    const checkpoints = [...formData.checkpoints, newCheckpoint]
    
    this.setData({
      'formData.checkpoints': checkpoints,
      tempCheckpoint: {
        name: '',
        coordinates: null
      }
    })
  },

  // 删除打卡点
  deleteCheckpoint: function(e) {
    const index = e.currentTarget.dataset.index
    const { formData } = this.data
    
    const checkpoints = formData.checkpoints.filter((_, i) => i !== index)
    // 重新分配id
    checkpoints.forEach((checkpoint, i) => {
      checkpoint.id = i + 1
    })
    
    this.setData({ 'formData.checkpoints': checkpoints })
  },

  // 下一步
  nextStep: function() {
    const { currentStep, formData } = this.data
    
    // 验证第一步
    if (currentStep === 0) {
      if (!formData.title) {
        wx.showToast({
          title: '请输入活动标题',
          icon: 'none'
        })
        return
      }
      
      if (!formData.coverImage) {
        wx.showToast({
          title: '请选择封面图片',
          icon: 'none'
        })
        return
      }
      
      if (!formData.location || !formData.coordinates) {
        wx.showToast({
          title: '请选择活动地点',
          icon: 'none'
        })
        return
      }
    }
    
    this.setData({ currentStep: currentStep + 1 })
  },

  // 上一步
  prevStep: function() {
    const { currentStep } = this.data
    if (currentStep > 0) {
      this.setData({ currentStep: currentStep - 1 })
    }
  },

  // 提交表单
  submitForm: function() {
    const { formData } = this.data
    
    // 验证
    if (formData.checkpoints.length === 0) {
      wx.showToast({
        title: '请至少添加一个打卡点',
        icon: 'none'
      })
      return
    }
    
    // 开始提交
    this.setData({ submitting: true })
    
    // 模拟上传图片
    const uploadCoverImage = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('/images/activity' + (Math.floor(Math.random() * 3) + 1) + '.jpg')
        }, 1000)
      })
    }
    
    // 先上传图片，再提交活动
    uploadCoverImage()
      .then((coverImageUrl) => {
        const data = {
          ...formData,
          coverImage: coverImageUrl,
          createdAt: new Date().toISOString()
        }
        
        return api.createActivity(data)
      })
      .then(res => {
        this.setData({ submitting: false })
        
        if (res && res.data && res.data.success) {
          wx.showToast({
            title: '创建成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }, 1500)
            }
          })
        }
      })
      .catch(err => {
        console.error('创建活动失败', err)
        this.setData({ submitting: false })
        
        wx.showToast({
          title: '创建失败',
          icon: 'none'
        })
      })
  }
}) 