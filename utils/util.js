// 日期格式化
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${[year, month, day].map(formatNumber).join('-')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 时间格式化
const formatTimeFromNow = dateString => {
  const date = new Date(dateString.replace(/-/g, '/'))
  const now = new Date()
  const diff = (now - date) / 1000 // 秒数

  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前'
  } else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前'
  } else if (diff < 2592000) {
    return Math.floor(diff / 86400) + '天前'
  } else {
    return formatDate(date)
  }
}

// 计算两点之间的距离（单位：米）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000 // 地球半径，单位米
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 检查位置是否在范围内
const isLocationInRange = (userLat, userLon, targetLat, targetLon, range = 100) => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon)
  return distance <= range
}

// 格式化距离显示
const formatDistance = (distance) => {
  if (distance < 1000) {
    return Math.round(distance) + 'm'
  } else {
    return (distance / 1000).toFixed(1) + 'km'
  }
}

// 生成唯一ID
const generateUniqueId = () => {
  return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

// 防抖函数
const debounce = (fn, delay = 500) => {
  let timer = null
  return function() {
    if (timer) {
      clearTimeout(timer)
    }
    const context = this
    const args = arguments
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

// 节流函数
const throttle = (fn, interval = 500) => {
  let last = 0
  return function() {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, arguments)
    }
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  }
}

// 复制文本到剪贴板
const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success() {
        resolve(true)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

// 显示Toast提示
const showToast = (title, icon = 'none') => {
  wx.showToast({
    title,
    icon
  })
}

module.exports = {
  formatTime,
  formatDate,
  formatTimeFromNow,
  calculateDistance,
  isLocationInRange,
  formatDistance,
  generateUniqueId,
  debounce,
  throttle,
  formatFileSize,
  copyToClipboard,
  showToast
}
