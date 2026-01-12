# Claude Code 2.1 项目实战配置

> 本文以真实企业级项目为例，详解如何通过 `.claude` 目录配置，将 Claude Code 打造成符合团队规范的专属 AI 编程助手。

---

## 2.1 版本核心变化

| 变化 | 2.0 | 2.1 |
| --- | --- | --- |
| **Skills 触发** | 需要 `skill-rules.json` 配置匹配规则 | 自动根据 `description` 智能匹配 |
| **Skills 热加载** | 修改后需重启 | 修改 SKILL.md 后立即生效 |
| **Commands** | 独立 `commands/` 目录 | 已废弃，合并到 Skills |
| **权限格式** | - | 新增 `Skill(/xxx)` 格式 |
| **上下文隔离** | - | 新增 `context: fork` 支持 |

**迁移要点**：

- 删除 `skill-rules.json`（不再需要）
- 将 `commands/*.md` 迁移到 `skills/*/SKILL.md`
- 在 SKILL.md 的 `description` 中写明触发词

---

## 一、目录结构

```
.claude/
├── settings.json          # 权限白名单、MCP 服务
├── settings.local.json    # 本地配置（不提交 Git）
├── rules/                 # 规则系统（自动加载）
│   ├── principles.md      # 核心原则
│   ├── workflow.md        # 工作流程
│   ├── quality.md         # 质量标准
│   ├── backend/python.md  # Python 规范（条件加载）
│   └── frontend/react.md  # React 规范（条件加载）
├── skills/                # 技能系统（按需激活）
│   ├── commit/SKILL.md
│   ├── test/SKILL.md
│   ├── review/SKILL.md
│   ├── search/SKILL.md
│   └── pkg/SKILL.md
└── agents/                # 自定义 Agent
    └── changelog-writer.md
```

---

## 二、Rules 规则系统

### 2.1 基础规则（始终加载）

放在 `rules/` 根目录，始终注入 System Prompt。

| 文件 | 职责 |
| --- | --- |
| `principles.md` | 核心原则：质量第一、思考先行 |
| `workflow.md` | 工作流程：检索优先、需求澄清 |
| `quality.md` | 质量标准：重构条件、注释规范 |

### 2.2 条件加载规则

通过 YAML front matter 的 `paths` 字段控制，只在编辑匹配文件时加载。

```markdown
---
paths: apps/backend/**/*.py---

# Python 后端开发规范

## 分层职责
| 层 | 职责 |
|----|------|
| API | @inject + Depends 注入 Service |
| Service | 首参 session，写操作调用 flush() |
| Repository | 无状态，不创建 Session |
```

---

## 三、Skills 技能系统

### 3.1 SKILL.md 格式

```markdown
---
name: review
description: "代码审查与重构。触发词：审查代码、review、检查质量、重构。"
allowed-tools:
  - Read
  - Grep
  - Bash(ruff*)
  - Bash(pyright*)
---

# 代码审查技能

## 审查流程
1. 静态分析：运行 ruff/pyright/eslint
2. 重构检测：函数 > 80 行、嵌套 > 3 层
3. 架构检查：分层正确、依赖注入规范
```

### 3.2 Frontmatter 字段

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `name` | 是 | Skill 名称 |
| `description` | 是 | 功能 + 触发词（Claude 据此自动匹配） |
| `allowed-tools` | 否 | 限制可用工具 |
| `context` | 否 | 设为 `fork` 在子代理中运行 |
| `user-invocable` | 否 | 是否在 `/` 菜单显示 |

### 3.3 当前可用 Skills

| Skill | 触发词 | 功能 |
| --- | --- | --- |
| `/commit` | commit、提交 | 生成规范提交消息 |
| `/test` | test、测试、pytest | 编写测试 |
| `/review` | 审查代码、review | 静态分析 + 架构检查 |
| `/search` | search、搜索 | 多源信息检索 |
| `/pkg` | pkg、升级依赖 | 升级 pnpm/pip 依赖 |

---

## 四、Hooks 生命周期钩子

### 4.1 支持的事件

| 事件 | 触发时机 |
| --- | --- |
| `PreToolUse` / `PostToolUse` | 工具执行前/后 |
| `UserPromptSubmit` | 用户提交消息时 |
| `Stop` / `SubagentStop` | 主/子代理停止时 |
| `SessionStart` / `SessionEnd` | 会话开始/结束时 |

### 4.2 配置示例

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "./scripts/check.sh"
      }]
    }]
  }
}
```

---

## 五、settings.json 配置

```json
{
  "language": "chinese",
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(git:*)",
      "Bash(ruff:*)",
      "Bash(pyright:*)",
      "WebSearch",
      "mcp__context7__*",
      "mcp__exa__*",
      "Skill(/commit)",
      "Skill(/review)",
      "Skill(/search)"
    ],
    "deny": []
  },
  "enableAllProjectMcpServers": true
}
```

| 配置项 | 说明 |
| --- | --- |
| `language` | 响应语言 |
| `permissions.allow` | 工具权限白名单 |
| `Skill(/xxx)` | 允许使用的 Skill（2.1 新格式） |
| `enableAllProjectMcpServers` | 自动启用项目 MCP |

---

## 六、最佳实践

### 规则设计

| 原则 | 说明 |
| --- | --- |
| 分层清晰 | 通用规则 vs 条件加载规则 |
| 职责单一 | 每个文件只负责一个领域 |
| 可验证 | 提供校验命令 |

### 技能设计

| 原则 | 说明 |
| --- | --- |
| 描述精准 | `description` 包含功能 + 触发词 |
| 工具受限 | `allowed-tools` 限制权限 |
| 输出标准 | 定义统一输出格式 |

---

## 参考链接

- Claude Code 官方文档
- CLAUDE.md 入口文件

---

> 更新日期：2025-01-12
