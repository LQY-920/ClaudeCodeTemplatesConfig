---
name: search
description: "多源信息检索与对比分析。触发词：搜索、查一下、怎么用、最佳实践..."
allowed-tools: WebSearch, WebFetch, mcp__context7__*, mcp__exa__*
---

# 多源搜索技能

专用于技术文档检索、最佳实践查询和问题排查。

---

## 触发场景

- 查询库/框架的使用方法
- 搜索最佳实践和设计模式
- 排查错误和兼容性问题
- 了解新技术和行业动态

---

## 三步执行流程

### 第一步：判断查询类型

| 类型 | 判断依据 | 工具选择 |
|------|----------|----------|
| **库/框架相关** | 包含具体库名（NestJS、Vue、Prisma） | Context7 + Web Search |
| **通用技术** | 最佳实践、设计模式、架构 | Web Search |
| **问题排查** | 错误信息、异常、Bug | Web Search |
| **最新资讯** | 新版本、公告、更新 | Web Search（限定时间） |

### 第二步：并行调用工具

#### 库/框架查询示例
```
用户：NestJS 怎么实现 JWT 认证？

执行步骤：
1. mcp__context7__resolve-library-id("nestjs")
2. mcp__context7__query-docs(libraryId, "JWT authentication guard")
3. WebSearch("NestJS JWT authentication 2024 best practices")
```

#### 通用技术查询示例
```
用户：微服务架构设计最佳实践

执行步骤：
1. WebSearch("microservices architecture best practices 2024")
2. WebSearch("微服务架构设计模式")
```

#### 问题排查示例
```
用户：Prisma P2002 错误怎么解决？

执行步骤：
1. WebSearch("Prisma P2002 unique constraint violation solution")
2. mcp__context7__query-docs(prismaLibraryId, "P2002 error handling")
```

### 第三步：综合分析输出

---

## 输出格式

```markdown
## 搜索结果：{用户查询}

### 来源对比

| 来源 | 核心观点 | 可信度 | 时效性 |
|------|----------|--------|--------|
| Context7: {库名} | 官方文档要点 | 高（官方） | 最新 |
| Web: [标题](url) | 文章/博客要点 | 中-高 | YYYY-MM |

### 综合结论

1. **官方推荐**：根据官方文档，推荐的做法是...
2. **社区实践**：社区普遍采用的方式是...
3. **推荐方案**：结合项目情况，建议采用...

### 代码示例

```typescript
// 示例代码
```

### 注意事项

- 注意点 1
- 注意点 2

### 参考链接

- [来源标题1](url1)
- [来源标题2](url2)
```

---

## 常见查询模板

### NestJS 相关
- "NestJS {功能} implementation"
- "NestJS {功能} best practices 2024"
- "@nestjs/{包名} usage example"

### Vue 3 相关
- "Vue 3 {功能} composition api"
- "Vue 3 {组件库} usage"
- "Pinia {功能} example"

### Prisma 相关
- "Prisma {功能} example"
- "Prisma {错误码} solution"
- "Prisma MySQL {功能}"

### 微信小程序相关
- "微信小程序 {功能} 实现"
- "wx.{API} 使用方法"
- "小程序 {问题} 解决方案"

---

## 搜索技巧

### 提高搜索质量
- 使用英文搜索获取更多技术资料
- 添加年份限定获取最新内容
- 添加 "example" "tutorial" 获取教程
- 添加 "best practices" 获取最佳实践

### 过滤低质量结果
- 优先官方文档和知名技术博客
- 检查内容发布时间
- 交叉验证多个来源
