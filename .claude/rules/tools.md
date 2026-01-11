# 工具使用指南

本规则始终加载，定义各类工具的使用规范和优先级。

---

## Context7（文档检索）

专用于获取库/框架的最新官方文档与代码示例。

### 使用流程
1. 先调用 `mcp__context7__resolve-library-id` 获取库 ID
2. 再调用 `mcp__context7__query-docs` 获取文档

### 触发场景
- 新库上手，需要了解 API 用法
- 版本差异排查，如 Vue 2 vs Vue 3
- API 报错定位，查找正确用法
- 最佳实践查询

### 示例
```
用户：NestJS 怎么使用 Guards？

Claude：
1. 调用 resolve-library-id 获取 NestJS 库 ID
2. 调用 query-docs 查询 "Guards authentication"
3. 根据官方文档给出回答
```

---

## Web Search（实时网页检索）

专用于实时网页/新闻/博客/公告/社区问答搜索。

### 触发场景
- 官方站最新公告
- 漏洞/兼容性预警
- 训练截断后出现的新资料
- 社区讨论和解决方案

### 使用技巧
- 添加时间限定词，如 "2024" "latest"
- 添加站点限定，如 "site:github.com"
- 使用英文搜索获得更多结果

---

## Prisma CLI

### 常用命令
```bash
# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name <migration_name>

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（开发环境，会清空数据）
npx prisma migrate reset

# 打开 Prisma Studio
npx prisma studio

# 格式化 schema
npx prisma format

# 验证 schema
npx prisma validate
```

### 注意事项
- `migrate reset` 会清空所有数据，**生产环境禁用**
- 迁移名称使用英文下划线格式，如 `add_user_table`
- 修改 schema 后必须运行 `generate`

---

## Git 操作

### 分支命名
```
feature/xxx    - 新功能
fix/xxx        - Bug 修复
hotfix/xxx     - 紧急修复
refactor/xxx   - 重构
docs/xxx       - 文档更新
```

### 提交规范
```
<emoji> <type>: <description>

类型：
✨ feat:     新功能
🐞 fix:      Bug 修复
📔 docs:     文档更新
♻️ refactor: 重构
🔨 chore:    构建/依赖更新
🎨 style:    代码格式
✅ test:     测试相关
```

### 危险命令确认
以下命令执行前必须确认：
- `git reset --hard`
- `git push --force`
- `git branch -D`
- `git rebase`

---

## 文档优先级

遇到技术问题时，按以下优先级查找：

```
1. 用户明确要求 > 一切
   └─ 用户说"用 XXX 方式"，就用 XXX 方式

2. CLAUDE.md 与 rules/ > 其他规范
   └─ 项目自定义规范优先于通用规范

3. 项目文档 (docs/) > 外部最佳实践
   └─ 项目内部约定优先于行业惯例

4. Context7/WebSearch 最新文档 > AI 内置知识
   └─ 实时查询的文档优先于训练数据
```

---

## 代码检查工具

### ESLint
```bash
# 检查
npx eslint . --ext .ts,.tsx,.vue

# 自动修复
npx eslint . --ext .ts,.tsx,.vue --fix
```

### TypeScript
```bash
# 类型检查
npx tsc --noEmit

# 带项目引用的类型检查
npx tsc -b --noEmit
```

### Prettier
```bash
# 格式化检查
npx prettier --check .

# 格式化修复
npx prettier --write .
```

---

## 调试技巧

### NestJS 调试
```typescript
// 打印请求信息
@UseInterceptors(LoggingInterceptor)

// 查看 SQL 查询
prisma.$on('query', (e) => console.log(e.query));
```

### Vue 调试
```typescript
// Vue DevTools
// 浏览器安装 Vue.js devtools 扩展

// 打印响应式数据
import { toRaw } from 'vue';
console.log(toRaw(reactiveData));
```

### 小程序调试
```javascript
// 打印页面数据
console.log(this.data);

// 查看 AppData
// 使用微信开发者工具的 AppData 面板
```
