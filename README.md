# 班级接龙小程序

## 文件结构
```
miniprogram/
├── app.js
├── app.json
├── app.wxss
├── pages/
│   ├── index/          # 首页（创建/管理表单）
│   ├── create/         # 创建表单
│   ├── fill/           # 填写表单（公开页）
│   ├── success/        # 提交成功
│   ├── admin/          # 管理后台
│   └── list/           # 表单列表
├── components/          # 组件
└── utils/
    └── api.js          # API接口
```

## 使用方法
1. 打开微信公众平台 mp.weixin.qq.com 注册小程序账号
2. 下载微信开发者工具
3. 将此文件夹导入为项目
4. 修改 app.js 中的云开发环境ID（如果用云开发）
5. 或部署自己的服务器，修改 utils/api.js 中的接口地址

## 功能清单
- [x] 创建接龙表单
- [x] 生成分享链接/小程序码
- [x] 家长填写表单
- [x] 查看完成情况统计
- [x] 一键提醒未完成家长
- [x] 导出Excel
