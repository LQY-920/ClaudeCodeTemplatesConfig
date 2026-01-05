# Claude Code 项目模板配置

这是一个预配置的 Claude Code 项目模板，包含常用的技能（Skills）和 MCP 服务器配置，可快速启动新项目开发。

## 项目结构

```
CCProject/
├── frontend/              # 前端应用目录（待初始化）
├── backend/               # 后端应用目录（待初始化）
├── .claude/               # Claude Code 配置目录
│   ├── skills/            # 技能集合
│   │   ├── frontend-design/   # 前端设计技能
│   │   ├── skill-creator/     # 技能创建指南
│   │   └── xlsx/              # Excel 电子表格操作
│   ├── audio/             # 音频资源
│   └── settings.json      # Claude Code 设置
├── .mcp.json              # MCP 服务器配置（需自行创建）
├── CLAUDE.md              # Claude Code 项目指令
├── cc.bat                 # Claude Code 启动脚本
└── .gitignore             # Git 忽略文件配置
```

## 内置技能说明

### 1. frontend-design（前端设计）

用于创建高质量、独特的前端界面。当需要构建以下内容时自动触发：
- 网页组件、页面或应用
- 网站、落地页、仪表盘
- React/Vue 组件
- HTML/CSS 布局
- UI 美化设计

**特点**：避免千篇一律的 AI 风格，生成独特、专业的 UI 设计。

### 2. xlsx（电子表格处理）

全面的电子表格创建、编辑和分析能力：
- 支持 .xlsx、.xlsm、.csv、.tsv 等格式
- 公式编写与自动计算
- 数据格式化与可视化
- 财务模型构建
- 数据分析

**依赖**：需要安装 LibreOffice 用于公式重新计算。

### 3. skill-creator（技能创建器）

用于创建或更新 Claude Code 技能的指南：
- 技能结构规范
- 最佳实践
- 打包与分发

## MCP 服务器

项目支持以下 MCP 服务器（需在 `.mcp.json` 中配置）：

### Chrome DevTools

浏览器自动化和测试能力：
- 页面导航与截图
- 元素交互
- 网络请求监控
- 性能分析

### Context7

文档查询服务，获取最新的库和框架文档。

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/LQY-920/ClaudeCodeTemplatesConfig.git
cd ClaudeCodeTemplatesConfig
```

### 2. 配置 MCP 服务器

创建 `.mcp.json` 文件：

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 3. 启动 Claude Code

```bash
# Windows
cc.bat

# 或直接运行
claude
```

## 使用技能

技能会根据用户请求自动触发，也可通过斜杠命令手动调用：

```
/frontend-design    # 启用前端设计技能
/xlsx               # 启用电子表格处理
/skill-creator      # 启用技能创建指南
```

## 自定义开发

### 添加前端框架

在 `frontend/` 目录中初始化你喜欢的框架：

```bash
# React
npx create-react-app frontend

# Vue
npm create vue@latest frontend

# Next.js
npx create-next-app frontend
```

### 添加后端框架

在 `backend/` 目录中初始化后端：

```bash
# Node.js + Express
cd backend && npm init -y && npm install express

# Python + FastAPI
cd backend && pip install fastapi uvicorn
```

## 注意事项

1. **API 密钥安全**：`.mcp.json` 包含敏感信息，已在 `.gitignore` 中排除，请勿提交到公开仓库
2. **LibreOffice**：xlsx 技能的公式计算功能需要安装 LibreOffice
3. **Node.js**：MCP 服务器需要 Node.js 环境

## 许可证

技能文件包含各自的许可证，详见各技能目录下的 LICENSE.txt 文件。
