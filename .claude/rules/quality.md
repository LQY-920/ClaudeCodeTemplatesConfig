# 质量与性能标准

本规则始终加载，定义代码质量和性能的具体标准。

---

## 重构触发条件

以下情况**必须重构**：

| 条件 | 阈值 | 说明 |
|------|------|------|
| 函数行数 | > 80 行 | 多步骤流程可放宽至 120 行 |
| 嵌套深度 | > 3 层 | 使用 Early Return 模式减少嵌套 |
| 重复代码 | > 3 次 | 抽取为公共函数/组件 |
| 参数数量 | > 5 个 | 使用对象参数或 Builder 模式 |
| 圈复杂度 | > 10 | 拆分为多个小函数 |

---

## 注释规范

### 必须保留的注释
- 关键业务流程的说明
- 核心算法的逻辑解释
- 重点难点的解决思路
- 非显而易见的代码意图

### 必须删除的注释
- 无用的注释掉的代码
- 过时的说明
- 显而易见的注释（如 `// 获取用户` 后面是 `getUser()`）
- **任何 emoji 符号**

### 注释格式
```typescript
/**
 * 计算用户积分
 *
 * 积分规则：
 * 1. 基础积分 = 消费金额 * 0.1
 * 2. 会员加成 = 基础积分 * 会员等级系数
 * 3. 活动加成 = 基础积分 * 活动系数（如有）
 *
 * @param userId 用户ID
 * @param amount 消费金额（单位：分）
 * @returns 获得的积分数
 */
async function calculatePoints(userId: string, amount: number): Promise<number> {
  // ...
}
```

---

## 命名规范

### TypeScript/JavaScript
```typescript
// 变量：camelCase
const userName = 'John';

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 函数：camelCase，动词开头
function getUserById(id: string) {}

// 类：PascalCase
class UserService {}

// 接口/类型：PascalCase
interface UserDTO {}
type UserRole = 'admin' | 'user';

// 枚举：PascalCase，成员 UPPER_SNAKE_CASE
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
}

// 私有属性：camelCase，不加下划线前缀
class Service {
  private readonly userRepository: UserRepository;
}
```

### 文件命名
```
组件文件：PascalCase.vue / PascalCase.tsx
工具文件：camelCase.ts
类型文件：types.ts 或 xxx.types.ts
常量文件：constants.ts 或 xxx.constants.ts
```

---

## 性能标准

### 前端
- 首屏加载时间 < 3s
- 页面交互响应 < 100ms
- 列表渲染支持虚拟滚动（数据量 > 100 条时）
- 图片懒加载

### 后端
- API 响应时间 < 500ms（普通接口）
- 批量操作需分页或限制数量
- 数据库查询必须使用索引
- N+1 查询问题必须解决

### 数据库
- 单表数据量超过 100 万时考虑分表
- 复杂查询需添加合适的索引
- 避免 SELECT *，只查询需要的字段

---

## 测试要求

| 模块类型 | 测试要求 |
|----------|----------|
| 工具函数 | 单元测试覆盖核心逻辑 |
| API 接口 | 集成测试覆盖正常和异常场景 |
| 业务逻辑 | 单元测试覆盖边界条件 |
| UI 组件 | 关键组件需有快照测试 |

---

## 代码审查检查项

- [ ] 是否有 TypeScript 类型错误
- [ ] 是否有 ESLint 警告
- [ ] 是否有硬编码的敏感信息
- [ ] 是否有未处理的异常
- [ ] 是否有 console.log 调试代码
- [ ] 是否有注释掉的代码
- [ ] 是否符合命名规范
- [ ] 是否有重复代码
