Page({
  data: { form: null, filled: {}, draftSaved: false },

  onLoad(opt) {
    const id = opt.id
    const forms = wx.getStorageSync('myForms') || []
    const form = forms.find(f => f.id === id)
    if (!form) return wx.showToast({ title: '表单不存在', icon: 'none' })
    this.setData({ form })
    const cache = wx.getStorageSync('draft_' + id)
    if (cache) this.setData({ filled: cache, draftSaved: true })
  },

  onTextInput(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ ['filled.'+id]: e.detail.value })
    this.saveDraft()
  },

  onRadioChange(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ ['filled.'+id]: e.detail.value })
    this.saveDraft()
  },

  onMultiChange(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ ['filled.'+id]: e.detail.value.join(',') })
    this.saveDraft()
  },

  chooseImage(e) {
    const id = e.currentTarget.dataset.id
    wx.chooseMedia({ count: 1, mediaType: ['image'], success: res => {
      this.setData({ ['filled.'+id]: res.tempFiles[0].tempFilePath })
      this.saveDraft()
    }})
  },

  openSign(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '手写签名',
      editable: true,
      placeholderText: '请在此区域手写签名',
      success: res => {
        if (res.content) {
          // 签名板不支持图片，取文本作为签名
          this.setData({ ['filled.'+id]: res.content || '(已签名)' })
          this.saveDraft()
        }
      }
    })
  },

  saveDraft() {
    if (this.data.form && this.data.form.allowCache) {
      wx.setStorageSync('draft_' + this.data.form.id, this.data.filled)
    }
  },

  submit() {
    const { form, filled } = this.data
    for (const f of form.fields) {
      if (f.required && !filled[f.id]) {
        return wx.showToast({ title: `请填写${f.name}`, icon: 'none' })
      }
    }
    const forms = wx.getStorageSync('myForms') || []
    const idx = forms.findIndex(f => f.id === form.id)
    if (idx >= 0) {
      if (!forms[idx].responses) forms[idx].responses = []
      forms[idx].responses.push({
        id: Date.now().toString(36),
        submittedAt: new Date().toISOString(),
        data: filled,
        type: form.formType
      })
      forms[idx].completedCount = forms[idx].responses.length
      wx.setStorageSync('myForms', forms)
    }
    wx.removeStorageSync('draft_' + form.id)
    wx.redirectTo({ url: `/pages/success/success?title=${encodeURIComponent(form.title)}` })
  }
})
