# Changelog Writer Agent

当代码准备合并到主分支时，帮助生成专业的 CHANGELOG 条目。

---

## 触发词

- "生成 changelog"
- "写 changelog"
- "准备发布日志"
- "更新变更日志"

---

## 执行步骤

### Step 1: 理解变更

1. 从分支名称中提取 issue/feature 编号（如有）
2. 使用 `git diff main...HEAD` 查看所有变更
3. 使用 `git log main...HEAD --oneline` 查看提交历史
4. 识别核心功能或改进点

```bash
# 查看当前分支
git branch --show-current

# 查看与 main 分支的差异
git diff main...HEAD --stat

# 查看提交历史
git log main...HEAD --oneline
```

### Step 2: 分析模式

1. 查看最近的 CHANGELOG.md 条目
2. 理解项目的 changelog 风格和结构
3. 确定版本号规则

```bash
# 查看现有 CHANGELOG
head -50 CHANGELOG.md
```

### Step 3: 撰写条目

根据变更类型，组织 CHANGELOG 条目：

```markdown
## [版本号] - YYYY-MM-DD

### 新增 (Added)
- 新功能描述，聚焦用户价值

### 变更 (Changed)
- 改进描述，说明变化带来的好处

### 修复 (Fixed)
- Bug 修复描述，说明解决了什么问题

### 移除 (Removed)
- 删除的功能/特性

### 安全 (Security)
- 安全相关的修复
```

---

## 写作原则

### 用户视角
- 使用第二人称："你现在可以..."
- 聚焦用户价值，而非实现细节
- 说明变更带来的好处

### 简洁明了
- 每条不超过一行
- 避免技术术语
- 不需要说明代码改了哪些文件

### 分类准确
- Added：新增的功能
- Changed：对现有功能的改进
- Fixed：Bug 修复
- Removed：删除的功能
- Security：安全相关

---

## 输出格式

```markdown
## [1.2.0] - 2025-01-12

### 新增 (Added)
- 新增用户登录功能，支持微信小程序一键登录
- 新增订单导出功能，支持 Excel 格式

### 变更 (Changed)
- 优化用户列表加载速度，提升 50%
- 改进表单验证提示，错误信息更加友好

### 修复 (Fixed)
- 修复分页数据重复显示的问题
- 修复移动端菜单无法关闭的问题
```

---

## 版本号规则

遵循语义化版本 (Semantic Versioning)：

| 版本类型 | 说明 | 示例 |
|----------|------|------|
| Major | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| Minor | 新增功能（向后兼容） | 1.0.0 → 1.1.0 |
| Patch | Bug 修复（向后兼容） | 1.0.0 → 1.0.1 |

---

## 示例

### 输入
```
用户：生成 changelog

当前分支：feature/user-login
提交历史：
- feat: 实现微信登录接口
- feat: 添加 JWT Token 认证
- fix: 修复登录态刷新问题
- docs: 更新 API 文档
```

### 输出
```markdown
## [1.1.0] - 2025-01-12

### 新增 (Added)
- 新增微信小程序登录功能，支持一键授权登录
- 新增 JWT Token 认证机制，提升安全性

### 修复 (Fixed)
- 修复用户登录态异常刷新的问题

### 文档 (Documentation)
- 更新用户认证相关 API 文档
```
