# DailyPlan - 周计划与复盘

<p align="center">
  <img src="assets/icon-192.png" alt="DailyPlan Logo" width="80">
</p>

<p align="center">
  <b>个人每日工作计划、番茄钟、周复盘工具</b>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#使用指南">使用指南</a> ·
  <a href="#数据同步">数据同步</a> ·
  <a href="#技术栈">技术栈</a>
</p>

---

## ✨ 功能特性

- 📅 **周计划视图** — 按天规划任务，支持多周切换
- ⏱️ **番茄钟** — 25分钟专注计时，自动提醒休息
- ✅ **待办清单** — 每日任务管理，完成进度追踪
- 📊 **周复盘** — 成就记录、问题分析、改进计划
- 💡 **每日金句** — 励志语录轮播，保持动力
- 📄 **数据导出** — 支持 Markdown / JSON 格式导出
- ☁️ **飞书同步** — 与飞书多维表格双向同步
- 📱 **PWA 支持** — 可安装为桌面/手机应用，离线可用

## 🚀 快速开始

### 在线使用

直接访问: [http://211.159.173.109/daily-plan/](http://211.159.173.109/daily-plan/)

### 本地运行

```bash
git clone https://github.com/yinxiaowei10/daily-plan.git
cd daily-plan
npx serve .
```

### 安装为 PWA

1. 用 Chrome/Edge/Safari 打开页面
2. 点击地址栏右侧的 "安装" 图标
3. 添加到桌面，离线也能用

## 📖 使用指南

### 周计划

1. 在 "本周计划" 区域，点击任意一天
2. 输入任务，按回车添加
3. 点击复选框标记完成
4. 支持编辑和删除任务

### 番茄钟

1. 在 "番茄钟" 区域输入当前任务
2. 点击 "开始专注" 启动 25 分钟计时
3. 完成后自动提醒休息
4. 查看今日完成的番茄数量

### 周复盘

1. 在 "周复盘" 区域填写：
   - 本周成就
   - 遇到的问题
   - 下周改进计划
   - 心情评分
2. 数据自动保存到本地

### 数据导出

- **Markdown**: 生成周报文档，方便分享
- **JSON**: 完整数据备份，可恢复

## ☁️ 数据同步

### 飞书多维表格同步

1. 在飞书创建多维表格，添加以下字段：
   - 周期（文本）
   - 番茄钟完成数（数字）
   - 周总结（文本）
   - 问题（文本）
   - 改进（文本）
   - 心情（数字）
   - 同步时间（文本）

2. 获取飞书应用的 App ID 和 App Secret

3. 在 DailyPlan 设置中配置同步参数

4. 点击 "同步飞书" 按钮，数据自动同步

## 🛠️ 技术栈

- **前端**: 原生 HTML5 / CSS3 / ES6+
- **存储**: LocalStorage（本地）+ 飞书 Open API（云端）
- **PWA**: Service Worker + Manifest
- **构建**: 无需构建，纯静态站点

## 📁 项目结构

```
daily-plan/
├── index.html          # 入口页面
├── manifest.json       # PWA 配置
├── sw.js               # Service Worker
├── package.json        # 项目信息
├── README.md           # 说明文档
├── css/
│   └── style.css       # 样式
├── js/
│   ├── app.js          # 应用入口
│   ├── storage.js      # 本地存储
│   ├── pomodoro.js     # 番茄钟
│   ├── planner.js      # 计划与复盘
│   ├── export.js       # 数据导出
│   └── sync.js         # 飞书同步
└── assets/
    └── icon-*.png      # PWA 图标
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yinxiaowei10">yinxiaowei10</a>
</p>
