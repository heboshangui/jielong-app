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
  goHistory() {
    const id = this.data.form.id
    wx.navigateTo({ url: `/pages/history/history?id=${id}` })
  },
  exportExcel() {
    const { form, responses } = this.data
    if (!responses.length) return wx.showToast({ title: '暂无数据', icon: 'none' })
    wx.showLoading({ title: '正在生成…' })

    try {
      // 动态加载 xlsx 库（本地文件）
      const XLSX = require('../lib/xlsx.min.js')

      const fieldNames = form.fields.map(f => f.name)
      // 构建表头
      const header = ['序号', '提交时间', ...fieldNames]
      // 构建数据行
      const rows = responses.map((r, i) => {
        const row = [i + 1, r.submittedAt ? new Date(r.submittedAt).toLocaleString('zh-CN') : '']
        form.fields.forEach(f => {
          const val = r.data[f.id] || ''
          row.push(String(val))
        })
        return row
      })

      // 使用 SheetJS 构建工作簿
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      // 设置列宽
      const colWidths = fieldNames.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '接龙数据')

      // 生成 xlsx 二进制数据
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const buffer = wx.arrayBufferToBase64(Array.from(new Uint8Array(wbout)))

      const fileName = form.title.replace(/[\\/:*?"<>|]/g, '_') + '_导出.xlsx'
      const filePath = wx.env.USER_DATA_PATH + '/' + fileName

      wx.getFileSystemManager().writeFile({
        filePath,
        data: buffer,
        encoding: 'base64',
        success: () => {
          wx.hideLoading()
          wx.openDocument({
            filePath,
            fileType: 'xlsx',
            success: () => {
              wx.showToast({ title: '已打开Excel', icon: 'success' })
            },
            fail: err => {
              // fallback: 保存到 Downloads 目录
              wx.saveFile({
                tempFilePath: filePath,
                success: res => {
                  wx.showToast({ title: '已保存到: ' + res.savedFilePath, icon: 'none', duration: 3000 })
                },
                fail: () => {
                  wx.showToast({ title: '打开失败，请安装Excel', icon: 'none' })
                }
              })
            }
          })
        },
        fail: err => {
          wx.hideLoading()
          console.error('writeFile failed', err)
          this.exportCsvFallback(form, responses)
        }
      })
    } catch (e) {
      wx.hideLoading()
      console.error('xlsx export error', e)
      this.exportCsvFallback(form, responses)
    }
  },
  // CSV 降级方案
  exportCsvFallback(form, responses) {
    try {
      const fieldNames = form.fields.map(f => f.name)
      const headers = ['序号', '提交时间', ...fieldNames]
      let csv = '\uFEFF' + headers.join(',') + '\n'
      responses.forEach((r, i) => {
        const row = [i+1, new Date(r.submittedAt).toLocaleString('zh-CN')]
        form.fields.forEach(f => {
          const val = (r.data[f.id] || '').toString().replace(/"/g, '""')
          row.push(`"${val}"`)
        })
        csv += row.join(',') + '\n'
      })
      const fileName = encodeURIComponent(form.title + '_导出.csv')
      const filePath = wx.env.USER_DATA_PATH + '/' + fileName
      wx.getFileSystemManager().writeFile({
        filePath,
        data: csv,
        encoding: 'utf-8',
        success: () => {
          wx.openDocument({
            filePath,
            fileType: 'csv',
            success: () => wx.showToast({ title: 'CSV已打开', icon: 'success' }),
            fail: () => wx.showToast({ title: '导出失败', icon: 'none' })
          })
        }
      })
    } catch (err) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  }
})
