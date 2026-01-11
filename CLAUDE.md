# 项目配置入口

> 本项目是一个 Claude Code 配置脚手架，用于规范化 AI 辅助开发流程。

---

## 项目概述

这是一个全栈项目脚手架，包含以下模块：

| 模块 | 目录 | 技术栈 |
|------|------|--------|
| **服务端** | `apps/server/` | NestJS + TypeScript + Prisma + MySQL |
| **管理后台** | `apps/admin/` | Vue 3 + Vite + TypeScript + Element Plus |
| **小程序端** | `apps/miniprogram/` | 微信小程序原生（WXML/WXSS/JS） |

---

## Claude Code 配置说明

本项目使用 `.claude/` 目录进行 Claude Code 配置，实现：

### Rules 规则系统
- `rules/principles.md` - 核心原则（始终加载）
- `rules/workflow.md` - 工作流程（始终加载）
- `rules/quality.md` - 质量标准（始终加载）
- `rules/safety.md` - 安全规范（始终加载）
- `rules/tools.md` - 工具指南（始终加载）
- `rules/server/nestjs.md` - NestJS 规范（条件加载）
- `rules/admin/vue.md` - Vue 3 规范（条件加载）
- `rules/miniprogram/wechat.md` - 微信小程序规范（条件加载）

### Skills 技能系统
- `/review` - 代码审查与重构
- `/search` - 多源信息检索
- `/prisma` - Prisma 数据库操作
- `/api` - API 开发辅助

### Commands 自定义命令
- `/commit` - 生成规范化提交消息
- `/prisma-migrate` - Prisma 迁移辅助
- `/api-doc` - API 文档生成

### Hooks 生命周期钩子
- `UserPromptSubmit` - 技能激活提示
- `PostToolUse` - 文件修改追踪

---

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url> my-project
cd my-project

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 初始化数据库
npm prisma:migrate

# 5. 启动开发服务器
npm dev
```

---

## 目录结构

```
.
├── .claude/                    # Claude Code 配置
│   ├── settings.json           # 核心配置
│   ├── rules/                  # 规则系统
│   ├── skills/                 # 技能系统
│   ├── hooks/                  # 生命周期钩子
│   ├── commands/               # 自定义命令
│   └── agents/                 # 自定义代理
│
├── apps/
│   ├── server/                 # NestJS 服务端
│   │   ├── src/
│   │   │   ├── modules/        # 业务模块
│   │   │   ├── common/         # 公共模块
│   │   │   └── main.ts         # 入口文件
│   │   └── prisma/
│   │       └── schema.prisma   # 数据库模型
│   │
│   ├── admin/                  # Vue 3 管理后台
│   │   ├── src/
│   │   │   ├── views/          # 页面组件
│   │   │   ├── components/     # 公共组件
│   │   │   ├── stores/         # Pinia 状态
│   │   │   ├── api/            # API 接口
│   │   │   └── router/         # 路由配置
│   │   └── vite.config.ts
│   │
│   └── miniprogram/            # 微信小程序
│       ├── pages/              # 页面
│       ├── components/         # 组件
│       ├── utils/              # 工具函数
│       └── app.json            # 小程序配置
│
├── packages/                   # 共享包
│   └── shared/                 # 共享类型/工具
│
├── CLAUDE.md                   # 本文件
└── package.json
```

---

## 开发规范

详见 `.claude/rules/` 目录下的规则文件。

核心原则：
1. **中文优先** - 注释、文档、响应全部使用简体中文
2. **质量第一** - 禁止占位代码、TODO 注释、半成品
3. **思考先行** - 编码前先分析规划，优先根因分析
4. **类型安全** - TypeScript 严格模式，禁止 any 类型

---

## 常用命令

```bash
# 开发
npm dev                    # 启动所有服务
npm dev:server             # 仅启动服务端
npm dev:admin              # 仅启动管理后台

# 数据库
npm prisma:migrate         # 执行迁移
npm prisma:generate        # 生成 Prisma Client
npm prisma:studio          # 打开 Prisma Studio

# 构建
npm build                  # 构建所有项目
npm build:server           # 构建服务端
npm build:admin            # 构建管理后台

# 代码质量
npm lint                   # ESLint 检查
npm lint:fix               # ESLint 自动修复
npm typecheck              # TypeScript 类型检查
```

---

> 更新日期：2026-01-12
