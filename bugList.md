# Bug 记录清单

---

## BUG-001: Claude Code Hooks 日志输出不显示

### 基本信息

| 项目 | 内容 |
|------|------|
| **发现日期** | 2026-01-12 |
| **严重程度** | 中等 |
| **状态** | 待修复 |
| **影响范围** | `.claude/hooks/` 目录下所有 hook 脚本 |

---

### 问题现象

用户配置了 Claude Code 的 hooks 系统，包括：
- `UserPromptSubmit` - 技能激活提示
- `PostToolUse` - 文件修改追踪
- `Stop` - 任务完成提示音

在实际使用过程中（如初始化 NestJS 项目，创建 20+ 个文件），**用户在终端看不到任何 hook 的日志输出**。

---

### 排查过程

1. **检查 hook 是否执行**
   - 查看 `.claude/.session-tracking.json` 文件
   - 文件存在且记录了 20 个被修改的文件
   - **结论**：hook 脚本确实被执行了

2. **手动测试 hook 脚本**
   ```bash
   echo '{"tool_input":{"file_path":"test.txt"}}' | node .claude/hooks/post-tool-use-tracker.js
   ```
   - 输出正常：`文件修改追踪: -> test.txt [other]`
   - **结论**：脚本本身运行正常

3. **查阅 Claude Code 官方文档**
   - 发现 hooks 输出机制的关键说明

---

### 根本原因

**Claude Code hooks 的输出规范：**

| 输出流 | 用途 | 显示对象 |
|--------|------|----------|
| `stdout` | JSON 格式的控制信号 | Claude（AI） |
| `stderr` | 日志/错误/提示信息 | 用户（终端） |

**当前代码问题：**

hook 脚本使用 `console.log()` 输出日志，这会输出到 `stdout`。但 Claude Code 期望 `stdout` 是 JSON 格式的控制响应，**普通文本会被忽略**，不会显示给用户。

```javascript
// 当前代码（错误）
console.log('文件修改追踪:');
console.log('  -> ' + relativePath);

// 正确做法
console.error('文件修改追踪:');
console.error('  -> ' + relativePath);
```

---

### 涉及文件

需要修复的文件：

1. `.claude/hooks/post-tool-use-tracker.js`
   - 第 166-170 行：`console.log` -> `console.error`

2. `.claude/hooks/skill-activation-prompt.js`
   - 第 164-185 行：`console.log` -> `console.error`

---

### 解决方案

将所有 hook 脚本中用于用户提示的 `console.log()` 改为 `console.error()`：

**post-tool-use-tracker.js 修改：**
```javascript
// 修改前
console.log('');
console.log('文件修改追踪:');
console.log('  -> ' + relativePath + ' [' + areaLabel + ']');
console.log('  (本会话共修改 ' + tracking.modifiedFiles.length + ' 个文件)');
console.log('');

// 修改后
console.error('');
console.error('文件修改追踪:');
console.error('  -> ' + relativePath + ' [' + areaLabel + ']');
console.error('  (本会话共修改 ' + tracking.modifiedFiles.length + ' 个文件)');
console.error('');
```

**skill-activation-prompt.js 修改：**
```javascript
// 修改前
console.log('========== 技能激活建议 ==========');
// ...
console.log('==================================');

// 修改后
console.error('========== 技能激活建议 ==========');
// ...
console.error('==================================');
```

---

### 参考文档

- Claude Code Hooks 官方文档：https://zread.ai/anthropics/claude-code/27-pretooluse-and-posttooluse-hooks
- 关键说明：
  > "Use stderr for error messages that should be visible to users, and stdout for JSON responses to Claude."
  >
  > Exit codes:
  > - Exit code 0: Allow operation (stderr shown to user only)
  > - Exit code 1: Allow operation (stderr shown to user and Claude)
  > - Exit code 2: Block operation (stderr shown to Claude)

---

### 经验总结

1. Claude Code hooks 的 `stdout` 和 `stderr` 有明确的用途区分
2. 想要在用户终端显示信息，必须使用 `stderr`（`console.error`）
3. `stdout` 仅用于返回 JSON 格式的控制信号给 Claude

---
