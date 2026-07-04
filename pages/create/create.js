Page({
  data: {
    formType: 'sign', // 'sign'=填表接龙, 'checkin'=打卡接龙
    title: '',
    description: '',
    deadline: '',
    startDate: '',
    endDate: '',
    totalCount: 40,
    reminderEnabled: false,
    reminderTime: '07:30',
    reminderDays: ['1','2','3','4','5'], // Mon-Fri
    allowMakeup: false,
    allowCache: false,
    fields: [
      { id: 'name', name: '幼儿姓名', type: 'text', required: true, public: true },
      { id: 'signed', name: '是否已认真阅读并对幼儿负责', type: 'radio', options: ['是', '否'], required: true, public: true },
      { id: 'guardian', name: '家长/监护人', type: 'text', required: true, public: true },
      { id: 'phone', name: '联系电话', type: 'tel', required: true, public: true },
      { id: 'class', name: '班级', type: 'text', required: false, public: true, defaultValue: '大六班' },
      { id: 'signature', name: '手写签名', type: 'signature', required: false, public: true },
      { id: 'image', name: '截图', type: 'image', required: false, public: false },
    ],
    presetNames: [],
    presetInput: '',
    showFieldPicker: false,
  },

  onLoad() {
    const now = new Date()
    const pad = n => String(n).padStart(2,'0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
    const endDate = new Date(now.getTime() + 30*86400000)
    const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}`
    this.setData({ startDate: dateStr, endDate: endStr, deadline: dateStr + 'T23:59' })
  },

  setFormType(e) { this.setData({ formType: e.currentTarget.dataset.type }) },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onDeadlineChange(e) { this.setData({ deadline: e.detail.value }) },
  onStartChange(e) { this.setData({ startDate: e.detail.value }) },
  onEndChange(e) { this.setData({ endDate: e.detail.value }) },
  onCountChange(e) { this.setData({ totalCount: parseInt(e.detail.value) || 40 }) },
  toggleReminder() { this.setData({ reminderEnabled: !this.data.reminderEnabled }) },
  onReminderTimeChange(e) { this.setData({ reminderTime: e.detail.value }) },
  toggleDay(e) {
    const val = e.currentTarget.dataset.day
    const days = this.data.reminderDays.includes(val)
      ? this.data.reminderDays.filter(d => d !== val)
      : [...this.data.reminderDays, val].sort()
    this.setData({ reminderDays: days })
  },
  toggleMakeup() { this.setData({ allowMakeup: !this.data.allowMakeup }) },
  toggleCache() { this.setData({ allowCache: !this.data.allowCache }) },
  onPresetInput(e) { this.setData({ presetInput: e.detail.value }) },
  addPresetNames() {
    const names = this.data.presetInput.split(/[,\n，]/).map(s=>s.trim()).filter(Boolean)
    this.setData({ presetNames: [...new Set([...this.data.presetNames, ...names])], presetInput: '' })
  },
  clearPreset() { this.setData({ presetNames: [], presetInput: '' }) },
  removePreset(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ presetNames: this.data.presetNames.filter((_,i)=>i!==idx) })
  },

  toggleFieldRequired(e) {
    const idx = e.currentTarget.dataset.idx
    const fields = [...this.data.fields]
    fields[idx].required = !fields[idx].required
    this.setData({ fields })
  },
  toggleFieldPublic(e) {
    const idx = e.currentTarget.dataset.idx
    const fields = [...this.data.fields]
    fields[idx].public = !fields[idx].public
    this.setData({ fields })
  },
  removeField(e) {
    const idx = e.currentTarget.dataset.idx
    if (this.data.fields.length <= 1) return wx.showToast({ title:'至少保留一个字段', icon:'none' })
    this.setData({ fields: this.data.fields.filter((_,i)=>i!==idx) })
  },
  addField(e) {
    const type = e.currentTarget.dataset.type
    const typeMap = {
      text: { name:'单行填写', type:'text', required:false, public:true },
      tel: { name:'手机号', type:'tel', required:false, public:true },
      radio: { name:'单项选择', type:'radio', options:['选项A','选项B'], required:false, public:true },
      multi: { name:'多项选择', type:'multi', options:['选项A','选项B'], required:false, public:true },
      yesno: { name:'是否判断', type:'yesno', required:false, public:true },
      image: { name:'上传图片', type:'image', required:false, public:false },
      video: { name:'上传视频', type:'video', required:false, public:false },
      doc: { name:'上传文档', type:'doc', required:false, public:false },
      sign: { name:'手写签名', type:'signature', required:false, public:true },
    }
    const field = { id: 'f'+Date.now(), ...typeMap[type] }
    this.setData({ fields: [...this.data.fields, field] })
  },

  submit() {
    if (!this.data.title) return wx.showToast({ title:'请输入标题', icon:'none' })
    const form = {
      id: Date.now().toString(36),
      formType: this.data.formType,
      title: this.data.title,
      description: this.data.description,
      deadline: this.data.deadline,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      totalCount: this.data.totalCount,
      reminderEnabled: this.data.reminderEnabled,
      reminderTime: this.data.reminderTime,
      reminderDays: this.data.reminderDays,
      allowMakeup: this.data.allowMakeup,
      allowCache: this.data.allowCache,
      fields: this.data.fields,
      presetNames: this.data.presetNames,
      createdAt: new Date().toISOString(),
      responses: [],
      completedCount: 0,
    }
    const forms = wx.getStorageSync('myForms') || []
    forms.unshift(form)
    wx.setStorageSync('myForms', forms)
    wx.showToast({ title:'创建成功', icon:'success' })
    setTimeout(() => wx.navigateBack(), 1200)
  }
})
