const app = getApp()
Page({
  data: {
    forms: []
  },
  onLoad() {
    this.loadForms()
  },
  onShow() {
    this.loadForms()
  },
  loadForms() {
    const forms = wx.getStorageSync('myForms') || []
    this.setData({ forms })
  },
  goCreate() {
    wx.navigateTo({ url: '/pages/create/create' })
  },
  goAdmin(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/admin?id=${id}` })
  },
  copyLink(e) {
    const { id } = e.currentTarget.dataset
    const link = `pages/fill/fill?id=${id}`
    wx.setClipboardData({
      data: link,
      success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
    })
  }
})
