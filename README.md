# Claude Code 全栈项目脚手架

> 一套完整的 Claude Code 配置模板，实现 **Rules + Skills + Hooks** 三板斧配置，规范化 AI 辅助开发流程。

## 技术栈

| 模块 | 目录 | 技术栈 |
|------|------|--------|
| 服务端 | `apps/server/` | NestJS + TypeScript + Prisma + MySQL |
| 管理后台 | `apps/admin/` | Vue 3 + Vite + TypeScript + Element Plus |
| 小程序端 | `apps/miniprogram/` | 微信小程序原生（WXML/WXSS/JS） |

## 项目结构

```
.
├── .claude/                        # Claude Code 配置目录
│   ├── settings.json               # 核心配置（权限、钩子）
│   ├── settings.local.json         # 本地配置
│   │
│   ├── rules/                      # 规则系统
│   │   ├── principles.md           # 核心原则（始终加载）
│   │   ├── workflow.md             # 工作流程（始终加载）
│   │   ├── quality.md              # 质量标准（始终加载）
│   │   ├── safety.md               # 安全规范（始终加载）
│   │   ├── tools.md                # 工具指南（始终加载）
│   │   ├── server/nestjs.md        # NestJS 规范（条件加载）
│   │   ├── admin/vue.md            # Vue 3 规范（条件加载）
│   │   └── miniprogram/wechat.md   # 微信小程序规范（条件加载）
│   │
│   ├── skills/                     # 技能系统
│   │   ├── skill-rules.json        # 技能匹配规则
│   │   ├── review/                 # 代码审查技能
│   │   ├── search/                 # 多源搜索技能
│   │   ├── prisma/                 # 数据库操作技能
│   │   ├── api/                    # API 开发技能
│   │   ├── frontend-design/        # 前端设计技能
│   │   ├── ui-ux-pro-max/          # UI/UX 专业设计技能
│   │   ├── xlsx/                   # Excel 表格处理技能
│   │   └── skill-creator/          # 技能创建指南
│   │
│   ├── hooks/                      # 生命周期钩子
│   │   ├── skill-activation-prompt.js   # 技能激活提示
│   │   ├── post-tool-use-tracker.js     # 文件修改追踪
│   │   └── task-complete-sound.js       # 任务完成提示音
│   │
│   ├── commands/                   # 自定义命令
│   │   ├── commit.md               # Git 提交规范
│   │   ├── prisma-migrate.md       # 数据库迁移
│   │   └── api-doc.md              # API 文档生成
│   │
│   ├── agents/                     # 智能体
│   │   └── changelog-writer.md     # 变更日志生成
│   │
│   └── audio/                      # 音频资源
│       └── down.mp3                # 任务完成提示音
│
├── apps/                           # 应用目录（待初始化）
│   ├── server/                     # NestJS 服务端
│   ├── admin/                      # Vue 3 管理后台
│   └── miniprogram/                # 微信小程序
│
├── packages/                       # 共享包
│   └── shared/                     # 共享类型/工具
│
├── CLAUDE.md                       # 项目指令文件
├── package.json                    # npm workspaces 配置
└── .env.example                    # 环境变量模板
```

## 配置系统详解

### Rules 规则系统

规则分为**基础规则**（始终加载）和**条件规则**（按路径加载）：

| 规则文件 | 加载条件 | 说明 |
|----------|----------|------|
| `principles.md` | 始终 | 中文优先、质量第一、思考先行 |
| `workflow.md` | 始终 | 任务分析→规划→执行→验证 |
| `quality.md` | 始终 | 函数≤80行、嵌套≤3层、禁止any |
| `safety.md` | 始终 | 高危操作确认、敏感信息保护 |
| `tools.md` | 始终 | 工具使用优先级和规范 |
| `server/nestjs.md` | `apps/server/**/*.ts` | NestJS 模块化、依赖注入规范 |
| `admin/vue.md` | `apps/admin/**/*.{ts,vue}` | Vue 3 组合式 API、Element Plus |
| `miniprogram/wechat.md` | `apps/miniprogram/**/*` | 微信小程序原生开发规范 |

### Skills 技能系统

技能通过关键词或正则匹配自动激活，也可手动调用：

| 技能 | 触发词 | 说明 |
|------|--------|------|
| `/review` | 审查代码、review、重构、代码优化 | 代码审查与重构建议 |
| `/search` | 搜索、查一下、怎么用、最佳实践 | 多源信息检索与对比 |
| `/prisma` | prisma、数据库、迁移、schema | Prisma 数据库操作 |
| `/api` | api、接口、controller、service | API 开发辅助 |
| `/frontend-design` | 前端设计、UI、组件 | 高质量前端界面设计 |
| `/ui-ux-pro-max` | UI/UX、设计系统 | 专业级 UI/UX 设计 |
| `/xlsx` | Excel、表格、数据分析 | 电子表格处理 |
| `/skill-creator` | 创建技能、技能开发 | 技能创建指南 |

### Hooks 生命周期钩子

| 钩子 | 触发时机 | 功能 |
|------|----------|------|
| `skill-activation-prompt` | 用户提交前 | 根据输入匹配技能 |
| `post-tool-use-tracker` | 文件修改后 | 追踪变更文件 |
| `task-complete-sound` | 任务完成时 | 播放提示音 |

### Commands 自定义命令

```bash
/commit           # 生成规范化 Git 提交消息
/prisma-migrate   # Prisma 数据库迁移向导
/api-doc          # 生成 API 文档
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/LQY-920/ClaudeCodeTemplatesConfig.git my-project
cd my-project
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 MCP 服务器

创建 `.mcp.json` 文件：

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 4. 初始化应用（按需）

```bash
# 初始化 NestJS 服务端
cd apps && npx @nestjs/cli new server

# 初始化 Vue 3 管理后台
npm create vue@latest admin

# 微信小程序使用微信开发者工具创建
```

### 5. 启动 Claude Code

```bash
claude
```

## 常用命令

```bash
# 开发
npm run dev                # 启动所有服务
npm run dev:server         # 仅启动服务端
npm run dev:admin          # 仅启动管理后台

# 数据库
npm run prisma:migrate     # 执行迁移
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:studio      # 打开 Prisma Studio

# 构建
npm run build              # 构建所有项目
npm run build:server       # 构建服务端
npm run build:admin        # 构建管理后台

# 代码质量
npm run lint               # ESLint 检查
npm run lint:fix           # ESLint 自动修复
npm run typecheck          # TypeScript 类型检查
```

## 开发规范

核心原则：

1. **中文优先** - 注释、文档、响应全部使用简体中文
2. **质量第一** - 禁止占位代码、TODO 注释、半成品
3. **思考先行** - 编码前先分析规划，优先根因分析
4. **类型安全** - TypeScript 严格模式，禁止 any 类型

详细规范请参阅 `.claude/rules/` 目录。

## 注意事项

1. **API 密钥安全**：`.mcp.json` 包含敏感信息，已在 `.gitignore` 中排除
2. **Node.js 版本**：需要 Node.js >= 18.0.0
3. **LibreOffice**：xlsx 技能的公式计算功能需要安装 LibreOffice
4. **提示音**：确保 `.claude/audio/down.mp3` 文件存在以启用任务完成提示

## 许可证

MIT License

---

> 基于 [Claude Code 进阶：Rules + Skills + Hooks 三板斧配置指南](https://mp.weixin.qq.com/s/cZqR-y2te-CJzfaiVAydmw) 设计
