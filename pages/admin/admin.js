Page({
  data: { form: null, responses: [], searchKey: '', allCount: 0, totalCount: 40 },
  onLoad(opt) {
    const id = opt.id
    const forms = wx.getStorageSync('myForms') || []
    const form = forms.find(f => f.id === id)
    if (!form) return wx.showToast({ title: '表单不存在', icon: 'none' })
    this.setData({ form, totalCount: form.totalCount || 40 })
    this.refreshResponses()
  },
  refreshResponses() {
    const { form } = this.data
    const responses = form.responses || []
    const today = new Date().toISOString().slice(0,10)
    if (form.formType === 'checkin') {
      // 打卡：只显示今日打卡
      const todayResponses = responses.filter(r => r.submittedAt && r.submittedAt.slice(0,10) === today)
      this.setData({ responses: todayResponses, allCount: todayResponses.length })
    } else {
      this.setData({ responses, allCount: responses.length })
    }
  },
  onSearch(e) {
    this.setData({ searchKey: e.detail.value.toLowerCase() })
    this.refreshResponses()
  },
  copyShareLink() {
    const id = this.data.form.id
    wx.setClipboardData({
      data: `pages/fill/fill?id=${id}`,
      success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
    })
  },
  showRemind() {
    const { form, allCount } = this.data
    const remain = form.totalCount - allCount
    if (remain <= 0) return wx.showToast({ title: '已全部完成', icon: 'success' })
    wx.showModal({
      title: '一键提醒',
      content: `还有 ${remain} 人未${form.formType==='checkin'?'打卡':'完成'}，请通过微信群发送提醒`,
      confirmText: '知道了', showCancel: false
    })
  },
  exportExcel() {
    const { form, responses } = this.data
    if (!responses.length) return wx.showToast({ title: '暂无数据', icon: 'none' })
    const fieldNames = form.fields.map(f => f.name)
    const headers = ['序号', '提交时间', ...fieldNames]
    let csv = '\uFEFF' + headers.join(',') + '\n'
    responses.forEach((r, i) => {
      const row = [i+1, new Date(r.submittedAt).toLocaleString('zh-CN')]
      form.fields.forEach(f => {
        const val = r.data[f.id] || ''
        row.push(`"${val}"`)
      })
      csv += row.join(',') + '\n'
    })
    const fileName = encodeURIComponent(form.title + '_导出.csv')
    wx.setStorageSync('exportCsv', csv)
    wx.showToast({ title: '数据已准备好', icon: 'success' })
  }
})
