# Claude Code 进阶：Rules + Skills + Hooks 三板斧配置指南

> 本文以真实企业级项目为例，详解如何通过 `.claude` 目录配置，将 Claude Code 打造成符合团队规范的专属 AI 编程助手。

---

## 一、为什么需要配置 Claude Code？

开箱即用的 Claude Code 是一个通用型 AI 编程助手，但在实际项目中，我们往往面临这些问题：

- **规范不统一**：AI 生成的代码风格与团队规范不符
- **上下文缺失**：AI 不了解项目架构，给出的建议不切实际
- **重复沟通**：每次都要重复说明"我们用 FastAPI"、"禁止用 any 类型"
- **工具滥用**：AI 随意执行危险命令，缺乏权限控制

**解决方案**：通过 `.claude` 目录配置，将团队规范、项目架构、工具权限"固化"到 Claude Code 中。

---

## 二、目录结构总览

```
.claude/
├── settings.json          # 核心配置：权限白名单、Hooks 注册
├── settings.local.json    # 本地配置（不提交 Git）
│
├── rules/                 # 规则系统（自动加载到 System Prompt）
│   ├── principles.md      # 核心原则（始终加载）
│   ├── workflow.md        # 工作流程（始终加载）
│   ├── quality.md         # 质量标准（始终加载）
│   ├── safety.md          # 安全规范（始终加载）
│   ├── tools.md           # 工具指南（始终加载）
│   ├── backend/
│   │   └── python.md      # Python 规范（条件加载）
│   └── frontend/
│       └── react.md       # React 规范（条件加载）
│
├── skills/                # 技能系统（按需激活）
│   ├── skill-rules.json   # 技能激活规则
│   ├── review/
│   │   └── SKILL.md       # 代码审查技能
│   ├── search/
│   │   └── SKILL.md       # 多源搜索技能
│   └── pkg/
│       └── SKILL.md       # 依赖升级技能
│
├── hooks/                 # 生命周期钩子（事件驱动）
│   ├── skill-activation-prompt.ts   # 用户提交时触发
│   └── post-tool-use-tracker.ts     # 工具使用后触发
│
├── commands/              # 自定义命令（/xxx 触发）
│   └── commit.md          # /commit 命令
│
└── agents/                # 自定义 Agent
    └── changelog-writer.md
```

---

## 三、Rules 规则系统

### 3.1 基础规则（始终加载）

**principles.md - 核心原则**

```markdown
# 核心不可变原则

## 语言规范
- 全程中文思维、中文表述
- 代码注释、文档、响应全部使用简体中文

## 质量第一
- 禁止占位代码、MVP 代码、TODO 注释
- 禁止半成品和兼容性僵尸代码

## 思考先行
- 编码前先分析规划
- 优先根因分析而非打补丁

## 设计优先级
依赖注入 > 工厂模式 > 继承
```

**workflow.md - 工作流程**

```markdown
# 任务执行流程

## 1. 检索优先
回答问题或执行任务前，必须先全面检索相关代码/文件

## 2. 需求澄清
通过多角度、多维度的提问引导用户明确需求

## 3. 精准定位
基于检索结果，精准定位需改动的代码部分

## 4. 信息充分性判断
评估当前信息是否足够，必要时向用户提问

## 5. 方案讲解
对修改计划进行详略得当的讲解，善用伪代码辅助说明
```

**quality.md - 质量标准**

```markdown
# 质量与性能标准

## 重构触发条件（必须重构）
- 函数超过 80 行（多步骤流程可放宽至 120 行）
- 嵌套超过 3 层
- 重复代码超过 3 次

## 注释规范
- 保留必要中文注释（关键流程/核心逻辑/重点难点）
- 删除无用代码和注释
- **禁止在代码注释中使用任何 emoji 符号**
```

**safety.md - 安全规范**

```markdown
# 高风险操作确认

执行以下操作前，必须获得用户明确确认：

## 文件操作
- 删除文件或目录
- 批量文件改动

## Git 操作
- git commit / git push
- git reset / git rebase
- 分支删除

## 数据库操作
- 数据库结构变更（DDL）
- 批量数据修改/删除
```

**tools.md - 工具使用指南**

```markdown
# 工具使用指南

## Context7（文档检索）
专用于获取库/框架的最新官方文档与代码示例。

### 使用流程
1. 先调用 `resolve-library-id` 获取库 ID
2. 再调用 `get-library-docs`，需指定 `topic` 和 `tokens`

### 触发场景
- 新库上手、版本差异排查、API 报错定位

## Exa Search（实时网页检索）
专用于实时网页/新闻/博客/公告/社区问答搜索。

### 触发场景
- 官方站最新公告、漏洞/兼容性预警
- 训练截断后出现的新资料

## 文档优先级
1. 用户明确要求 > 一切
2. CLAUDE.md 与 rules/ > 其他规范
3. 项目文档 (docs/) > 外部最佳实践
4. Context7、Exa 最新文档 > AI 内置知识
```

---

### 3.2 条件加载规则（核心特性）

条件加载规则通过 **YAML front matter** 中的 `paths` 字段控制，只在编辑匹配的文件时加载。

**backend/python.md - Python 后端规范**

```markdown
---
paths: apps/backend/**/*.py
---

# Python 后端开发规范

本规则仅在编辑 `apps/backend/` 下的 Python 文件时生效。

## 质量标准
- Pyright 零错误、Ruff 零警告
- 函数必须有类型注解
- **禁止**`# noqa` 和 `# type: ignore`

## 导入规范
- **禁止**`from src.xxx` 前缀
- 使用 `from domain.xxx`、`from core.xxx`

## 分层职责

| 层 | 职责 |
|----|------|
| **API** | `@inject` + `Depends(Provide["..."])` 注入 Service |
| **Service** | 方法首参 `session: AsyncSession`，写操作显式 `flush/commit` |
| **Repository** | Singleton 无状态，不创建 Session，不 commit |

## 校验命令

```bash
../../.venv/bin/ruff format src/ && ../../.venv/bin/ruff check --fix src/
../../.venv/bin/pyright src/
```
```

**frontend/react.md - React 前端规范**

```markdown
---
paths: apps/frontend/**/*.{ts,tsx}, apps/console/**/*.{ts,tsx}
---

# React 前端开发规范

本规则仅在编辑前端 TypeScript/React 文件时生效。

## 类型安全
- **禁止** 使用 `any` 类型
- 启用 strict mode
- 使用 `type` 而非 `interface`（除非需要扩展）

## 技术栈
- **React 19**（React Router 7）：函数组件 + Hooks
- **TypeScript 5.9**：严格模式
- **shadcn/ui**：可定制的 Radix UI 组件
- **Tailwind CSS 4.x**：实用优先 CSS

## 代码校验命令

```bash
# 类型检查（必须 0 errors）
pnpm --filter @provider-aip/<app> exec tsc -b --noEmit

# Lint（必须 0 errors 0 warnings）
pnpm lint --fix
```

## 快速示例

```tsx
// shadcn/ui 组件
import { Button } from "@/components/ui/button"
<Button variant="default">Click me</Button>

// Tailwind 样式
<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow">

// framer-motion 动画
import { motion } from "framer-motion"
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// lucide 图标
import { Search } from "lucide-react"
<Search className="w-4 h-4 text-gray-500" />
```
```

**条件加载的价值**：
- Python 项目不会被 JavaScript 规则干扰
- 前端开发不会看到后端的 Session 管理规范
- 减少 Token 消耗，提高响应速度

---

## 四、Skills 技能系统

### 4.1 技能定义格式

每个技能是一个目录，包含 `SKILL.md` 文件：

```
skills/
├── skill-rules.json      # 激活规则（关键词 + 正则）
└── review/
    ├── SKILL.md          # 技能定义
    └── PATTERNS.md       # 参考文档（可选）
```

**SKILL.md 格式**：

```markdown
---
name: review
description: "代码审查与重构。触发词：审查代码、review、检查质量、重构..."
allowed-tools: Read, Grep, Glob, Bash(ruff*), Bash(pyright*), Bash(pnpm lint*)
---

# 代码审查技能

## 触发场景
- 审查代码、review、检查质量
- 重构、代码精简、优化设计

## 审查流程

### 1. 静态分析
```bash
# 后端
cd apps/backend
../../.venv/bin/ruff check src/ --fix
../../.venv/bin/pyright src/

# 前端/控制台
pnpm --filter @provider-aip/frontend lint
pnpm --filter @provider-aip/console lint
```

### 2. 重构检测

| 条件 | 阈值 |
| --- | --- |
| 函数行数 | > 80 行 |
| 嵌套深度 | > 3 层 |
| 重复代码 | > 3 次 |

### 3. 架构检查

- 后端：Session 显式传递、依赖注入在容器、分层正确
- 前端：组件单一职责、Hook 规范、禁止 any

## 输出格式

```
### P0 - 必须修复
- [文件:行号] 问题 → 建议

### P1 - 建议修复
- [文件:行号] 问题 → 建议

### 设计模式建议
- 场景 → 推荐模式
```
```

---

### 4.2 技能激活规则

**skill-rules.json**：

```json
{
  "version": "1.0",
  "skills": {
    "review": {
      "type": "domain",
      "priority": "high",
      "description": "代码审查与重构",
      "triggers": {
        "keywords": [
          "审查代码", "review", "检查质量",
          "重构", "代码精简", "优化设计",
          "code review", "代码审查"
        ],
        "intentPatterns": [
          "帮我(审查|review|检查).*代码",
          "这段代码.*问题",
          "重构.*建议"
        ],
        "pathPatterns": [
          "apps/backend/src/**/*.py",
          "apps/frontend/src/**/*.tsx"
        ]
      }
    },
    "search": {
      "type": "domain",
      "priority": "medium",
      "description": "多源信息检索",
      "triggers": {
        "keywords": [
          "search", "搜索", "查询最佳实践",
          "对比调研", "怎么用", "最佳实践"
        ],
        "intentPatterns": [
          "搜索.*", "查一下.*",
          ".*怎么用", ".*最佳实践"
        ]
      }
    },
    "pkg": {
      "type": "domain",
      "priority": "medium",
      "description": "依赖升级",
      "triggers": {
        "keywords": [
          "pkg", "upgrade", "deps",
          "升级依赖", "更新包", "npm升级", "pip升级"
        ],
        "intentPatterns": [
          "升级.*依赖", "更新.*包",
          "检查.*过期", "依赖.*最新"
        ]
      }
    }
  }
}
```

**匹配算法**：

- 关键词命中：+10 分/个
- 正则命中：+20 分/个
- 优先级加成：critical=100, high=75, medium=50, low=25
- 按总分排序，推荐得分最高的技能

---

### 4.3 多源搜索技能示例

**search/SKILL.md**：

```markdown
---
name: search
description: "多源信息检索与对比分析..."
allowed-tools: WebSearch, WebFetch, mcp__exa__*, mcp__context7__*
---

# 多源搜索技能

## 三步执行流程

### 第一步：判断查询类型

| 类型 | 判断依据 | 工具选择 |
|------|---------|---------|
| **技术/库相关** | 包含库名、框架名、API | Context7 + Exa (code) |
| **通用技术** | 最佳实践、设计模式 | Exa (web + code) |
| **问题排查** | 错误信息、异常 | Exa (web) + WebSearch |

### 第二步：并行调用工具

```python
# 技术库查询（如 "search React hooks 最佳实践"）
1. mcp__context7__resolve-library-id → 获取库 ID
2. mcp__context7__get-library-docs → 获取官方文档
3. mcp__exa__get_code_context_exa → 获取代码示例

# 通用技术查询（如 "search 微服务架构设计"）
1. mcp__exa__web_search_exa → 博客、教程
2. mcp__exa__get_code_context_exa → 代码示例
```

### 第三步：综合分析输出

## 输出格式

```
## 搜索结果：{用户查询}

### 来源对比

| 来源 | 核心观点 | 可信度 | 时效性 |
|------|---------|-------|-------|
| Context7: {库名} | 官方文档要点 | 高（官方） | 最新 |
| Exa: [标题](url) | 文章要点 | 中-高 | YYYY-MM |

### 综合结论

1. **共识点**：各来源一致认为...
2. **差异点**：官方文档侧重...，社区实践侧重...
3. **推荐方案**：基于以上分析，建议采用...

### 参考链接

- [来源标题1](url1)
- [来源标题2](url2)
```
```

---

## 五、Hooks 生命周期钩子

### 5.1 钩子配置

**settings.json**：

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)", "Bash(python:*)", "Bash(git:*)",
      "Bash(ruff:*)", "Bash(pyright:*)", "Bash(pytest:*)",
      "WebSearch",
      "mcp__context7__*",
      "mcp__exa__*",
      "mcp__chrome-devtools__*"
    ],
    "deny": []
  },
  "enableAllProjectMcpServers": true,
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-tracker.sh"
          }
        ]
      }
    ]
  }
}
```

---

### 5.2 技能激活钩子

**skill-activation-prompt.ts**（核心逻辑）：

```typescript
/**
 * 在用户提交 prompt 时自动匹配并建议相关 Skill
 * 触发时机: UserPromptSubmit
 */

interface SkillRule {
  type: "domain" | "command";
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  triggers: {
    keywords?: string[];
    intentPatterns?: string[];
  };
}

// 优先级权重
const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

// 关键词匹配
function matchKeywords(prompt: string, keywords: string[]): string[] {
  const lowerPrompt = prompt.toLowerCase();
  return keywords.filter((kw) => lowerPrompt.includes(kw.toLowerCase()));
}

// 意图模式匹配（正则）
function matchIntentPatterns(prompt: string, patterns: string[]): string[] {
  const matched: string[] = [];
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(prompt)) {
      matched.push(pattern);
    }
  }
  return matched;
}

// 计算匹配分数
function calculateScore(
  matchedKeywords: string[],
  matchedPatterns: string[],
  priority: string
): number {
  const keywordScore = matchedKeywords.length * 10;
  const patternScore = matchedPatterns.length * 20;
  const priorityScore = PRIORITY_WEIGHTS[priority] || 0;
  return keywordScore + patternScore + priorityScore;
}

// 格式化输出
function formatOutput(matches: MatchResult[]): string {
  const lines: string[] = [
    "",
    "╔══════════════════════════════════════════════════════════════╗",
    "║                   🎯 SKILL ACTIVATION CHECK                  ║",
    "╚══════════════════════════════════════════════════════════════╝",
    "",
  ];

  // 按优先级分组输出
  const labels = {
    critical: "🔴 CRITICAL (Required)",
    high: "🟠 HIGH (Recommended)",
    medium: "🟡 MEDIUM (Suggested)",
    low: "🟢 LOW (Optional)",
  };

  for (const [priority, label] of Object.entries(labels)) {
    const group = matches.filter(m => m.rule.priority === priority);
    if (group.length > 0) {
      lines.push(`${label}:`);
      for (const match of group) {
        lines.push(`  → /${match.skillName}: ${match.rule.description}`);
        if (match.matchedKeywords.length > 0) {
          lines.push(`    匹配关键词: ${match.matchedKeywords.join(", ")}`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
```

**效果展示**：

当用户输入"帮我审查这段代码"时，Hook 自动输出：

```
╔══════════════════════════════════════════════════════════════╗
║                   🎯 SKILL ACTIVATION CHECK                  ║
╚══════════════════════════════════════════════════════════════╝

🟠 HIGH (Recommended):
  → /review: 代码审查与重构
    匹配关键词: 审查, 代码

────────────────────────────────────────────────────────────────
```

---

### 5.3 文件追踪钩子

**post-tool-use-tracker.ts**（核心逻辑）：

```typescript
/**
 * 追踪 Edit/Write/MultiEdit 修改的文件
 * 触发时机: PostToolUse (matcher: Edit|MultiEdit|Write)
 */

// 项目区域检测规则
const PROJECT_AREAS: Record<string, RegExp[]> = {
  backend: [/apps\/backend\//, /\.py$/],
  frontend: [/apps\/frontend\//, /\.tsx?$/],
  console: [/apps\/console\//],
  config: [/\.json$/, /\.yaml$/, /\.toml$/],
  docs: [/docs\//, /\.md$/],
  tests: [/tests?\//, /\.test\.[tj]sx?$/],
};

// 检测项目区域
function detectProjectAreas(filePath: string): string[] {
  const areas: string[] = [];
  for (const [area, patterns] of Object.entries(PROJECT_AREAS)) {
    for (const pattern of patterns) {
      if (pattern.test(filePath)) {
        areas.push(area);
        break;
      }
    }
  }
  return areas;
}

// 追踪会话修改的文件
interface TrackedSession {
  session_id: string;
  modified_files: string[];
  project_areas: string[];
  last_updated: string;
}
```

**效果展示**：

当 Claude 编辑文件后，Hook 自动输出：

```
📝 文件修改追踪:
  → apps/backend/src/domain/chat/service.py [backend]
  → apps/frontend/src/components/ChatBox.tsx [frontend]
  (本会话共修改 2 个文件)
```

---

## 六、Commands 自定义命令

### 6.1 命令定义格式

**commands/commit.md**：

```markdown
---
description: 生成符合规范的提交消息
---

分析当前 git diff，生成符合项目 Git 提交规范的提交消息。

## 提交规范

格式：`<emoji> <type>: <description>`

| Emoji | 类型 | 说明 |
|-------|------|------|
| ✨ | New Features | 新功能 |
| 🐞 | Bug Fixes | BUG修复 |
| 🔨 | Dependency Upgrades | 依赖升级 |
| 📔 | Documentation | 更新文档 |
| ♻️ | Refactor | 代码重构 |

## 执行步骤

1. 运行 `git diff --cached --stat` 查看已暂存的变更
2. 如果没有暂存变更，运行 `git diff --stat` 查看未暂存变更
3. 分析变更内容，判断属于哪种类型
4. 生成简洁的中文描述（聚焦 "why" 而非 "what"）
5. 输出完整的提交消息

## 输出格式

```
<emoji> <type>: <简短标题>

<详细描述（可选）>
```
```

**使用方式**：

```
用户：/commit
Claude：分析 git diff，生成提交消息...

✨ New Features: 新增用户画像 RAG 检索功能

- 实现 Profile → Filter → Ranking 整链
- 支持个性化排序与 category boost
```

---

## 七、Agents 自定义代理

### 7.1 代理定义格式

**agents/changelog-writer.md**：

```markdown
# Changelog Writer Agent

当代码准备合并到主分支时，帮助生成专业的 CHANGELOG 条目。

## 执行步骤

### Step 1: 理解变更
1. 从分支名称中提取 issue/feature 编号
2. 使用 `git diff main...HEAD` 查看所有变更
3. 识别核心功能或改进点

### Step 2: 分析模式
1. 查看最近的 CHANGELOG.md 条目
2. 理解项目的 changelog 风格和结构

### Step 3: 撰写条目

```markdown
## [版本号] - YYYY-MM-DD

### 新增 (Added)
- 功能描述，聚焦用户价值

### 变更 (Changed)
- 改进描述

### 修复 (Fixed)
- Bug 修复描述
```

**写作原则**：

- 使用第二人称（"你现在可以..."）
- 聚焦用户价值，而非实现细节
- 简洁明了，避免技术术语

## 触发词

- "生成 changelog"
- "写 changelog"
- "准备发布日志"
```

---

## 八、完整配置模板

### 8.1 settings.json 模板

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(npm:*)",
      "Bash(python:*)",
      "Bash(pip:*)",
      "Bash(git:*)",
      "Bash(ruff:*)",
      "Bash(pyright:*)",
      "Bash(pytest:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
      "Bash(cat:*)",
      "Bash(mkdir:*)",
      "WebSearch",
      "mcp__context7__*",
      "mcp__exa__*"
    ],
    "deny": []
  },
  "enableAllProjectMcpServers": true,
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-tracker.sh"
          }
        ]
      }
    ]
  }
}
```

### 8.2 快速开始脚本

```bash
#!/bin/bash
# 初始化 .claude 目录结构

mkdir -p .claude/{rules/{backend,frontend},skills,hooks,commands,agents}

# 创建基础规则
cat > .claude/rules/principles.md << 'EOF'
# 核心原则

- 全程中文表述
- 质量第一，禁止占位代码
- 编码前先分析规划
EOF

# 创建 settings.json
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(npm:*)", "WebSearch"],
    "deny": []
  }
}
EOF

echo "✅ .claude 目录初始化完成"
```

---

## 九、最佳实践总结

### 9.1 规则设计原则

| 原则 | 说明 |
| --- | --- |
| **分层清晰** | 通用规则 vs 条件加载规则 |
| **职责单一** | 每个规则文件只负责一个领域 |
| **可执行** | 规则要具体到可执行的命令/检查项 |
| **可验证** | 提供校验命令，让 Claude 自检 |

### 9.2 技能设计原则

| 原则 | 说明 |
| --- | --- |
| **触发明确** | 关键词 + 正则双重匹配 |
| **工具受限** | `allowed-tools` 限制可用工具 |
| **输出标准化** | 定义统一的输出格式 |
| **可组合** | 技能之间可以相互引用 |

### 9.3 钩子设计原则

| 原则 | 说明 |
| --- | --- |
| **静默失败** | 钩子出错不影响主流程 |
| **轻量执行** | 避免耗时操作阻塞用户 |
| **信息增强** | 输出辅助信息，不强制行为 |

---

## 十、参考链接

- Claude Code 官方文档
- CLAUDE.md 入口文件

---

> 更新日期：2025-12-23

---

*来源：微信公众号「YaoguoHH AI」*
