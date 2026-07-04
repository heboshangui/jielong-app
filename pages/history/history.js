// 历史打卡记录页面
Page({
  data: {
    form: null,
    groupedRecords: [],
    searchKey: ''
  },

  onLoad(opt) {
    const id = opt.id
    const forms = wx.getStorageSync('myForms') || []
    const form = forms.find(f => f.id === id)
    if (!form) return wx.showToast({ title: '表单不存在', icon: 'none' })
    this.setData({ form })
    this.loadHistory()
  },

  loadHistory() {
    const { form, searchKey } = this.data
    if (!form || !form.responses) return

    let responses = form.responses
    if (searchKey) {
      responses = responses.filter(r =>
        (r.data['幼儿姓名'] || '').toLowerCase().includes(searchKey.toLowerCase())
      )
    }

    // 按姓名分组
    const byPerson = {}
    responses.forEach(r => {
      const name = r.data['幼儿姓名'] || '未知'
      if (!byPerson[name]) byPerson[name] = []
      byPerson[name].push(r)
    })

    // 每人的记录按日期分组
    const grouped = Object.entries(byPerson).map(([name, records]) => {
      const byDate = {}
      records.forEach(r => {
        const date = r.submittedAt ? r.submittedAt.slice(0, 10) : '未知'
        if (!byDate[date]) byDate[date] = []
        byDate[date].push(r)
      })
      const dates = Object.keys(byDate).sort().reverse()
      return { name, dates, byDate, totalCount: records.length }
    })

    // 按总打卡次数降序
    grouped.sort((a, b) => b.totalCount - a.totalCount)
    this.setData({ groupedRecords: grouped })
  },

  onSearch(e) {
    this.setData({ searchKey: e.detail.value })
    this.loadHistory()
  },

  togglePerson(e) {
    const idx = e.currentTarget.dataset.idx
    const groupedRecords = this.data.groupedRecords.map((g, i) => {
      if (i === idx) g._expanded = !g._expanded
      return g
    })
    this.setData({ groupedRecords })
  },

  // 统计摘要
  getStats() {
    const { groupedRecords } = this.data
    const totalPersons = groupedRecords.length
    const totalRecords = groupedRecords.reduce((sum, g) => sum + g.totalCount, 0)
    const dates = new Set()
    groupedRecords.forEach(g => g.dates.forEach(d => dates.add(d)))
    return { totalPersons, totalRecords, totalDays: dates.size }
  }
})
