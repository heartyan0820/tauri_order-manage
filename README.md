# 订单管理系统（Tauri + Vue3 三端应用）

一套代码同时运行在 **Web 端 / 桌面端（Windows/macOS/Linux）/ 移动端（Android/iOS）** 的订单管理系统。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 请求 | Axios（封装拦截器） |
| 桌面端 | Tauri v2 |
| 移动端 | Tauri v2（Android/iOS） |
| 数据 | Mock 数据（可无缝切换真实 API） |

## 功能模块

- **登录鉴权**：登录页 + Token 管理 + 路由守卫 + 退出登录（默认账号 admin/123456）
- **数据概览**：总订单数、待处理、已完成、总营收、近7天趋势图、状态分布
- **订单管理**：订单列表（搜索/筛选/分页）、订单详情、新增订单、编辑订单
- **导出 Excel**：一键导出当前页订单为 .xlsx 文件（基于 xlsx 库）
- **系统托盘**：桌面端最小化到系统托盘，点击托盘图标显示/隐藏窗口，关闭按钮最小化而非退出
- **消息推送**：新订单实时轮询提醒，桌面端系统通知 + Web 端浏览器通知
- **响应式布局**：桌面端侧边栏+表格，移动端底部导航+卡片列表

## 目录结构

```
order-management/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── .env                      # 环境变量（API地址/Mock开关）
├── src/
│   ├── main.ts               # 入口
│   ├── App.vue
│   ├── style.css             # 全局样式（含响应式）
│   ├── router/index.ts       # 路由（含登录守卫）
│   ├── stores/
│   │   ├── order.ts          # 订单状态管理
│   │   └── auth.ts           # 认证状态管理（登录/退出/token）
│   ├── api/
│   │   ├── request.ts        # Axios 封装（拦截器）
│   │   └── order.ts          # 订单接口（Mock + 真实API双模式）
│   ├── types/order.ts        # TypeScript 类型定义
│   ├── mock/data.ts          # Mock 数据
│   ├── utils/
│   │   ├── excel.ts          # Excel 导出工具
│   │   └── notify.ts         # 桌面/Web 通知工具
│   ├── components/
│   │   └── OrderForm.vue     # 新增/编辑订单弹窗
│   └── views/
│       ├── Login.vue         # 登录页
│       ├── Layout.vue        # 布局（侧边栏+顶栏+底部导航+新订单轮询）
│       ├── Dashboard.vue     # 数据概览
│       ├── OrderList.vue     # 订单列表
│       └── OrderDetail.vue   # 订单详情
└── src-tauri/                # Tauri 桌面端
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    └── src/main.rs
```

---

## 一、Web 端运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器打开 http://localhost:1420

打包：
```bash
pnpm build
# 产物在 dist/ 目录，部署到任意静态服务器
```

---

## 二、桌面端运行（Windows / macOS / Linux）

### 环境准备
- Node.js 18+
- Rust（通过 https://rustup.rs 安装）
- Windows：Visual Studio Build Tools（勾选"使用 C++ 的桌面开发"）

### 运行
```bash
pnpm install
pnpm tauri dev
```

### 打包
```bash
pnpm tauri build
```

产物在 `src-tauri/target/release/`：
- Windows: `bundle/msi/`（MSI安装包）、`bundle/nsis/`（.exe安装包）
- macOS: `bundle/dmg/`（.dmg）
- Linux: `bundle/deb/`、`bundle/appimage/`

---

## 三、移动端运行（Android / iOS）

Tauri v2 原生支持移动端，一套代码直接编译为 App。

### Android

#### 环境准备
1. 安装 Android Studio
2. 安装 Android SDK（API 34+）和 Android NDK
3. 配置环境变量：
   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export NDK_HOME="$ANDROID_HOME/ndk/<version>"
   ```

#### 初始化 Android 工程
```bash
pnpm tauri android init
```

#### 运行到设备/模拟器
```bash
pnpm tauri android dev
```

#### 打包 APK
```bash
pnpm tauri android build
```
产物在 `src-tauri/gen/android/app/build/outputs/apk/`

### iOS（需 macOS）

```bash
pnpm tauri ios init
pnpm tauri ios dev
pnpm tauri ios build
```

---

## 四、API 接口配置

项目默认使用 Mock 数据，切换真实后端只需两步：

### 1. 修改 `.env`

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_USE_MOCK=false
```

### 2. 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/orders` | 订单列表（分页+筛选） |
| GET | `/orders/:id` | 订单详情 |
| POST | `/orders` | 创建订单 |
| PUT | `/orders/:id` | 更新订单 |
| DELETE | `/orders/:id` | 删除订单 |
| PUT | `/orders/:id/status` | 更新订单状态 |
| GET | `/dashboard/stats` | 仪表盘统计 |

### 请求参数（订单列表）

```typescript
interface OrderQuery {
  page: number;
  pageSize: number;
  keyword?: string;      // 订单号/客户名/手机号
  status?: string;       // pending/processing/shipped/completed/cancelled
  type?: string;         // normal/urgent/return
  startDate?: string;
  endDate?: string;
}
```

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

Axios 拦截器已统一处理：`code !== 0/200` 时抛出错误，直接返回 `data` 字段。

---

## 五、桌面端 HTTP 请求注意

Tauri 桌面端中，浏览器的 fetch/XHR 可能受 CORS 限制。项目已集成 `@tauri-apps/plugin-http`，如需在桌面端绕过 CORS，可将 axios 的 adapter 替换为 Tauri 的 fetch：

```typescript
import { fetch } from "@tauri-apps/plugin-http";
// 在 request.ts 中配置 axios adapter 使用 Tauri fetch
```

当前 Mock 模式下不受影响，接入真实 API 时按需配置即可。

---

## 六、自定义图标

```bash
# 准备一张 1024x1024 的 PNG 图标
pnpm tauri icon ./path/to/icon.png
```

会自动生成各端所需的图标格式。
