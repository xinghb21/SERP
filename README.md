# AI 搜索实验平台（Bing / Bing Chat 模拟系统）

本项目用于模拟 Bing 和 Bing Chat 搜索平台，支持行为追踪（鼠标、键盘、滚动、悬停）、用户任务分发与反馈收集。前端使用 React + TypeScript，后端使用 Express 搭建 RESTful API。

## 项目结构

```txt
project-root/
├── frontend/                # 前端 React 应用
│   ├── public/
│   ├── src/
│   │   ├── components/      # 登录页、反馈页、搜索/聊天页等
│   │   ├── hooks/           # 行为追踪 useBehaviorTracker
│   │   ├── routes/          # BingSearch / BingChat 页面
│   │   ├── types/           # SessionContext 类型定义
│   │   └── App.tsx          # 路由入口
│   ├── vite.config.ts       # 配置跨域代理
│   └── package.json
│
├── backend/                 # 后端 Express 应用
│   ├── routes/              # search / chat / track 等接口模块
│   │   ├── search.js
│   │   ├── chat.js
│   │   └── track.js
│   ├── server.js            # 启动入口，加载各个路由
│   └── package.json
│
└── README.md
```

## 运行方式

### 克隆并安装依赖

```bash
git clone https://github.com/xinghb21/SERP.git

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

---

### 启动前后端服务

#### 启动后端（端口默认 5000）

```bash
cd server
npm run dev
```

#### 启动前端（端口默认 5173）

```bash
cd client
npm run dev
```

### 访问页面

打开浏览器访问：<http://localhost:5173>

你将看到登录界面，填写用户名、平台（Bing / Bing Chat）和任务类型后进入实验。
