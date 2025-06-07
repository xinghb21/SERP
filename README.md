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
git clone https://github.com/your-name/ai-search-experiment.git
cd ai-search-experiment

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

---

### 启动前后端服务

#### 🖥 启动后端（端口默认 5000）

```bash
cd server
npm run dev
```

确保接口目录下存在 `search.js`, `chat.js`, `track.js` 等模块。

#### 🌐 启动前端（端口默认 5173）

```bash
cd client
npm run dev
```

---

### 3️⃣ 访问页面

打开浏览器访问：

```
http://localhost:5173
```

你将看到登录界面，填写用户名、平台（Bing / Bing Chat）和任务类型后进入实验。

---

## 🧩 功能说明

| 模块        | 功能描述                                         |
| --------- | -------------------------------------------- |
| 登录页面      | 输入用户名、选择平台、选择任务，进入搜索/聊天实验页面                  |
| Bing 搜索   | 模拟传统搜索引擎结构，分为输入组件、信息承载组件、扩展组件                |
| Bing Chat | 模拟聊天式问答场景，支持上下文多轮提问                          |
| 行为追踪      | 记录用户点击、输入、悬停、滚动等操作，按组件标注 `data-component` 记录 |
| 实验任务池     | 登录后从任务类型中随机分配具体任务，在页面顶部展示                    |
| 实验结束      | 点击“结束实验”跳转反馈页面，后续可扩展问卷或可用性评分                 |

---

## 🛠️ 配置代理（可选）

确保 `client/vite.config.ts` 中已代理请求：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## 📄 环境变量（可选）

在 `server/.env` 中配置：

```
PORT=5000
API_KEY=your-real-api-key
```

---

## 📦 构建与部署（生产）

```bash
# 前端打包
cd client
npm run build

# 后端处理静态文件（可选）
# 可用 express.static() 服务 client/dist 目录
```

---

## 📌 TODO

* [x] 任务池与组件行为记录
* [x] 多平台登录跳转
* [x] 后端接口模块化
* [ ] 多用户并发支持
* [ ] 实验数据导出 / 管理后台

---

如需根据你本地项目结构具体定制路径或内容，我也可以进一步帮你调整。是否需要我帮你生成这个 README.md 文件并落地到项目中？
