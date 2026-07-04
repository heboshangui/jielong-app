Page({
  data: {
    title: '',
    description: '',
    deadline: '',
    totalCount: 40,
    fields: [
      { name: '幼儿姓名', type: 'text', required: true },
      { name: '是否已认真阅读并对幼儿负责', type: 'radio', options: ['是', '否'], required: true },
      { name: '家长/监护人', type: 'text', required: true },
      { name: '联系电话', type: 'tel', required: true },
      { name: '班级', type: 'text', default: '大六班', required: false }
    ]
  },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onDeadlineChange(e) { this.setData({ deadline: e.detail.value }) },
  onCountChange(e) { this.setData({ totalCount: parseInt(e.detail.value) || 40 }) },
  submit() {
    if (!this.data.title) return wx.showToast({ title: '请输入标题', icon: 'none' })
    const form = {
      id: Date.now().toString(36),
      title: this.data.title,
      description: this.data.description,
      deadline: this.data.deadline,
      totalCount: this.data.totalCount,
      fields: this.data.fields,
      createdAt: new Date().toISOString(),
      completedCount: 0,
      responses: []
    }
    const forms = wx.getStorageSync('myForms') || []
    forms.unshift(form)
    wx.setStorageSync('myForms', forms)
    wx.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1200)
  }
})
