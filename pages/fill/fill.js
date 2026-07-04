const app = getApp()
Page({
  data: {
    form: null,
    filled: {}
  },
  onLoad(opt) {
    const id = opt.id
    // 优先从本地表单列表加载
    const forms = wx.getStorageSync('myForms') || []
    const form = forms.find(f => f.id === id)
    if (!form) return wx.showToast({ title: '表单不存在', icon: 'none' })
    this.setData({ form })
  },
  onNameInput(e) { this.setData({ 'filled.幼儿姓名': e.detail.value }) },
  onRadioChange(e) { this.setData({ 'filled.是否已认真阅读并对幼儿负责': e.detail.value }) },
  onGuardianInput(e) { this.setData({ 'filled.家长/监护人': e.detail.value }) },
  onTelInput(e) { this.setData({ 'filled.联系电话': e.detail.value }) },
  onClassInput(e) { this.setData({ 'filled.班级': e.detail.value }) },
  submit() {
    const { form, filled } = this.data
    if (!filled.幼儿姓名) return wx.showToast({ title: '请填写幼儿姓名', icon: 'none' })
    if (!filled.是否已认真阅读并对幼儿负责) return wx.showToast({ title: '请选择', icon: 'none' })
    if (!filled.家长/监护人) return wx.showToast({ title: '请填写家长姓名', icon: 'none' })
    if (!filled.联系电话) return wx.showToast({ title: '请填写联系电话', icon: 'none' })
    // 保存到本地
    const forms = wx.getStorageSync('myForms') || []
    const idx = forms.findIndex(f => f.id === form.id)
    if (idx >= 0) {
      if (!forms[idx].responses) forms[idx].responses = []
      if (!forms[idx].completedCount) forms[idx].completedCount = 0
      forms[idx].responses.push({ id: Date.now().toString(36), submittedAt: new Date().toISOString(), data: filled })
      forms[idx].completedCount = forms[idx].responses.length
      wx.setStorageSync('myForms', forms)
    }
    wx.redirectTo({ url: `/pages/success/success?title=${encodeURIComponent(form.title)}` })
  }
})
