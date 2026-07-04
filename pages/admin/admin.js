Page({
  data: { form: null, responses: [], searchKey: '' },
  onLoad(opt) {
    const id = opt.id
    const forms = wx.getStorageSync('myForms') || []
    const form = forms.find(f => f.id === id)
    if (!form) return wx.showToast({ title: '表单不存在', icon: 'none' })
    this.setData({ form, responses: form.responses || [] })
  },
  onSearch(e) {
    const key = e.detail.value.toLowerCase()
    this.setData({ searchKey: key })
  },
  getFiltered() {
    const { form, searchKey } = this.data
    const all = form.responses || []
    if (!searchKey) return all
    return all.filter(r => (r.data.幼儿姓名 || '').toLowerCase().includes(searchKey))
  },
  copyShareLink() {
    const id = this.data.form.id
    wx.setClipboardData({
      data: `pages/fill/fill?id=${id}`,
      success: () => wx.showToast({ title: '分享链接已复制', icon: 'success' })
    })
  },
  exportExcel() {
    const { form, responses } = this.data
    if (!responses.length) return wx.showToast({ title: '暂无数据', icon: 'none' })
    // 生成CSV格式（小程序不支持直接生成xlsx，用CSV代替）
    let csv = '\uFEFF' // BOM for UTF-8
    const fields = ['幼儿姓名', '是否已认真阅读并对幼儿负责', '家长/监护人', '联系电话', '班级', '提交时间']
    csv += fields.join(',') + '\n'
    responses.forEach(r => {
      const row = fields.map(f => {
        const val = f === '提交时间' ? new Date(r.submittedAt).toLocaleString('zh-CN') : (r.data[f] || '')
        return `"${val}"`
      }).join(',')
      csv += row + '\n'
    })
    wx.setStorageSync('exportCsv', csv)
    wx.showToast({ title: '数据已准备好', icon: 'success' })
  },
  showRemind() {
    const { form, responses } = this.data
    const total = form.totalCount || 40
    const done = responses.length
    const remain = total - done
    if (remain <= 0) return wx.showToast({ title: '已全部完成', icon: 'success' })
    wx.showModal({
      title: '一键提醒',
      content: `还有 ${remain} 人未完成接龙，请通过微信群发送提醒`,
      confirmText: '知道了',
      showCancel: false
    })
  }
})
