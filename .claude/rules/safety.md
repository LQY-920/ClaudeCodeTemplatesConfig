# 安全规范与高风险操作确认

本规则始终加载，定义安全规范和需要确认的高风险操作。

---

## 高风险操作确认

执行以下操作前，**必须获得用户明确确认**：

### 文件操作
- 删除文件或目录
- 批量文件改动（超过 5 个文件）
- 修改配置文件（如 `package.json`、`.env`）
- 覆盖已有文件

### Git 操作
- `git commit` / `git push`
- `git reset` / `git rebase`
- 分支删除（`git branch -D`）
- 强制推送（`git push --force`）

### 数据库操作
- 数据库结构变更（DDL）
- 批量数据修改/删除
- 执行迁移（`prisma migrate`）
- 重置数据库（`prisma migrate reset`）

### 依赖操作
- 添加新依赖
- 升级主版本号的依赖
- 删除依赖

---

## 敏感信息处理

### 绝对禁止
```
❌ 硬编码密码、密钥、Token
❌ 将敏感信息打印到控制台
❌ 将敏感信息写入日志文件
❌ 将敏感信息提交到 Git
```

### 正确做法
```typescript
// ✅ 使用环境变量
const jwtSecret = process.env.JWT_SECRET;

// ✅ 使用配置服务
const dbPassword = configService.get('DATABASE_PASSWORD');

// ✅ 敏感字段脱敏后再打印
console.log(`用户手机号: ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`);
```

---

## 输入验证

### 前端验证
```typescript
// 所有用户输入必须验证
const schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
});
```

### 后端验证
```typescript
// 使用 class-validator 进行 DTO 验证
export class CreateUserDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(8, { message: '密码至少8位' })
  password: string;

  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}
```

---

## SQL 注入防护

### 禁止做法
```typescript
// ❌ 拼接 SQL
const sql = `SELECT * FROM users WHERE id = '${userId}'`;

// ❌ 直接使用用户输入
prisma.$queryRaw(`SELECT * FROM users WHERE name = '${name}'`);
```

### 正确做法
```typescript
// ✅ 使用 Prisma ORM
const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ 使用参数化查询
const users = await prisma.$queryRaw`SELECT * FROM users WHERE name = ${name}`;
```

---

## XSS 防护

### 前端
```typescript
// ❌ 直接渲染 HTML
element.innerHTML = userInput;

// ✅ 使用文本内容
element.textContent = userInput;

// ✅ Vue 中使用 v-text 而非 v-html
<span v-text="userInput"></span>
```

### 后端
```typescript
// 对输出进行转义
import { escape } from 'html-escaper';
const safeOutput = escape(userInput);
```

---

## 认证与授权

### JWT 安全配置
```typescript
// ✅ 正确配置
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '7d',           // 设置过期时间
    algorithm: 'HS256',        // 指定算法
  },
});
```

### 权限检查
```typescript
// 每个接口必须明确权限要求
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  // ...
}
```

---

## 日志规范

### 应该记录
- 用户登录/登出
- 权限变更
- 数据修改操作
- 异常错误

### 不应该记录
- 密码、Token 等敏感信息
- 完整的信用卡号
- 身份证号等个人隐私

### 日志格式
```typescript
// ✅ 结构化日志
this.logger.log({
  action: 'USER_LOGIN',
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString(),
});
```

---

## 文件上传安全

```typescript
// 限制文件类型
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// 限制文件大小
const maxSize = 5 * 1024 * 1024; // 5MB

// 重命名文件，避免路径遍历
const safeFilename = `${uuid()}.${extension}`;
```
