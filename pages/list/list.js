Page({
  data: { forms: [] },
  onShow() {
    const forms = wx.getStorageSync('myForms') || []
    this.setData({ forms })
  }
})
