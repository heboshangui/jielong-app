Page({
  data: { title: '' },
  onLoad(opt) { this.setData({ title: decodeURIComponent(opt.title || '') }) }
})
