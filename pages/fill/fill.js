Page({
  data: { form: null, filled: {}, draftSaved: false, showSignModal: false, signFieldId: null },

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

  // 打开签名板
  openSign(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ showSignModal: true, signFieldId: id, signPath: '' })
    // 等待画布渲染后初始化
    setTimeout(() => {
      const ctx = wx.createCanvasContext('signCanvas')
      this.signCtx = ctx
      this.signPoints = []
      ctx.setStrokeStyle('#333')
      ctx.setLineWidth(3)
      ctx.setLineCap('round')
      ctx.setLineJoin('round')
      ctx.clearRect(0, 0, 300, 200)
      ctx.stroke()
      ctx.draw()
    }, 100)
  },

  // 触摸开始
  signTouchStart(e) {
    const { x, y } = e.touches[0]
    this.signPoints = [{ x, y }]
    this.signCtx.moveTo(x, y)
  },

  // 触摸移动
  signTouchMove(e) {
    const { x, y } = e.touches[0]
    this.signPoints.push({ x, y })
    this.signCtx.lineTo(x, y)
    this.signCtx.stroke()
    this.signCtx.draw(true)
  },

  // 清空签名
  signClear() {
    this.signPoints = []
    this.signCtx.clearRect(0, 0, 300, 200)
    this.signCtx.setStrokeStyle('#333')
    this.signCtx.setLineWidth(3)
    this.signCtx.stroke()
    this.signCtx.draw()
  },

  // 确认签名：把画布内容转成图片
  signConfirm() {
    const fieldId = this.data.signFieldId
    wx.canvasToTempFilePath({
      canvasId: 'signCanvas',
      success: res => {
        const tempFilePath = res.tempFilePath
        this.setData({ ['filled.'+fieldId]: tempFilePath, showSignModal: false })
        this.saveDraft()
        wx.showToast({ title: '签名已保存', icon: 'success' })
      },
      fail: err => {
        wx.showToast({ title: '签名失败', icon: 'none' })
      }
    })
  },

  // 取消签名
  signCancel() {
    this.setData({ showSignModal: false })
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
