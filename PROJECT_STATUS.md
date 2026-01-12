# 项目状态记录

> 本文件记录项目配置的演进历史和当前状态。

---

## 当前状态

| 项目 | 版本 | 状态 |
|------|------|------|
| **Claude Code** | 2.1.2 | ✅ 符合 2.1 规范 |
| **配置脚手架** | v2.1.0 | ✅ 已迁移到 2.1 |

---

## 更新历史

### 2025-01-12 - 迁移到 Claude Code 2.1 规范

**变更类型**: 重构（Breaking Changes）

**主要变更**:

#### 1. 技能系统迁移
- ❌ 删除 `skill-rules.json`（2.1 改用 description 自动匹配）
- ❌ 废弃 `commands/` 目录，合并到 `skills/`
- ✅ 新增 `skills/commit/SKILL.md`
- ✅ 新增 `skills/prisma-migrate/SKILL.md`
- ✅ 新增 `skills/api-doc/SKILL.md`

#### 2. 权限格式更新
- ✅ 新增 `Skill(/xxx)` 权限格式
- ✅ 更新 `settings.json` 权限配置

#### 3. Hooks 更新
- ✅ `skill-activation-prompt.js` 改为读取 SKILL.md frontmatter
- ✅ 支持从 description 中提取触发词

#### 4. 文档更新
- ✅ 新增 `doc/Claude_Code_2.1_项目实战配置.md`
- ✅ 更新 `README.md` 反映 2.1 变化
- ✅ 创建 `PROJECT_STATUS.md` 记录项目状态

#### 5. 其他变更
- ✅ `.mcp.json.example` → `.mcp.json`（重命名）
- ✅ 更新 `.gitignore` 白名单配置

---

## 技能清单（当前 11 个）

| 技能 | 触发词 | 用途 |
|------|--------|------|
| `/commit` | commit、提交、git commit | 生成规范化 Git 提交消息 |
| `/review` | 审查代码、review、重构 | 代码审查与重构建议 |
| `/search` | search、搜索、最佳实践 | 多源信息检索与对比 |
| `/prisma` | prisma、数据库、迁移 | Prisma 数据库操作 |
| `/prisma-migrate` | prisma、数据库、迁移、schema | Prisma 数据库迁移向导 |
| `/api` | api、接口、controller、service | API 开发辅助 |
| `/api-doc` | api、接口、文档、swagger | 生成 API 接口文档 |
| `/frontend-design` | 前端设计、UI、组件 | 高质量前端界面设计 |
| `/ui-ux-pro-max` | UI/UX、设计系统 | 专业级 UI/UX 设计 |
| `/xlsx` | Excel、表格、数据分析 | 电子表格处理 |
| `/skill-creator` | 创建技能、技能开发 | 技能创建指南 |

---

## Hooks 清单（当前 3 个）

| 钩子 | 触发时机 | 功能 |
|------|----------|------|
| `skill-activation-prompt.js` | UserPromptSubmit | 技能激活提示（读取 description） |
| `post-tool-use-tracker.js` | PostToolUse | 文件修改追踪 |
| `task-complete-sound.js` | Stop | 任务完成提示音 |

---

## 规则清单（当前 8 个）

### 基础规则（始终加载，5 个）
- `principles.md` - 核心原则
- `workflow.md` - 工作流程
- `quality.md` - 质量标准
- `safety.md` - 安全规范
- `tools.md` - 工具指南

### 条件规则（按路径加载，3 个）
- `server/nestjs.md` - `apps/server/**/*.ts`
- `admin/vue.md` - `apps/admin/**/*.{ts,vue}`
- `miniprogram/wechat.md` - `apps/miniprogram/**/*`

---

## MCP 服务器（当前 2 个）

| 服务器 | 类型 | 用途 |
|--------|------|------|
| `context7` | stdio | 获取库/框架最新文档 |
| `chrome-devtools` | stdio | 浏览器自动化测试 |

---

## 已废弃的功能

| 功能 | 废弃原因 | 替代方案 |
|------|----------|----------|
| `skill-rules.json` | 2.1 改用 description 自动匹配 | SKILL.md frontmatter |
| `commands/` 目录 | 2.1 合并到 skills/ | `skills/*/SKILL.md` |

---

## 下一步计划

- [ ] 初始化 `apps/server/` NestJS 项目
- [ ] 初始化 `apps/admin/` Vue 3 项目
- [ ] 初始化 `apps/miniprogram/` 微信小程序
- [ ] 添加更多自定义技能
- [ ] 完善 MCP 服务器配置

---

## 相关链接

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Claude Code 2.1 项目实战配置](https://mp.weixin.qq.com/s/uSdWSI1zlAuZ6uQ3Y3uEng)
