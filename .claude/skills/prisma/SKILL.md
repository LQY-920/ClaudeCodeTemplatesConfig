---
name: prisma
description: "Prisma 数据库操作。触发词：prisma、数据库、迁移、schema、模型..."
allowed-tools: Read, Write, Edit, Bash(npx prisma*), Bash(pnpm prisma*)
---

# Prisma 数据库操作技能

专用于 Prisma Schema 设计、迁移管理和数据库操作。

---

## 触发场景

- 设计数据库模型
- 创建/修改 Schema
- 执行数据库迁移
- 处理 Prisma 相关错误

---

## Schema 设计规范

### 基础模型模板

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 用户模型示例
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  avatar    String?
  role      UserRole @default(USER)
  status    Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // 关联
  posts     Post[]
  profile   Profile?

  @@map("users")
}

enum UserRole {
  ADMIN
  USER
}

// 一对一关联示例
model Profile {
  id        String   @id @default(uuid())
  bio       String?  @db.Text
  birthday  DateTime?
  userId    String   @unique @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("profiles")
}

// 一对多关联示例
model Post {
  id        String   @id @default(uuid())
  title     String   @db.VarChar(200)
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  String   @map("author_id")
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags      Tag[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([authorId])
  @@map("posts")
}

// 多对多关联示例
model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]

  @@map("tags")
}
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模型名 | PascalCase 单数 | `User`, `Post` |
| 字段名 | camelCase | `createdAt`, `userId` |
| 数据库表名 | snake_case 复数 | `@@map("users")` |
| 数据库列名 | snake_case | `@map("created_at")` |
| 枚举名 | PascalCase | `UserRole` |
| 枚举值 | UPPER_SNAKE_CASE | `ADMIN`, `USER` |

---

## 迁移操作

### 开发环境

```bash
# 创建迁移（推荐）
npx prisma migrate dev --name add_user_table

# 重置数据库（会清空数据！）
npx prisma migrate reset

# 生成 Prisma Client
npx prisma generate

# 查看迁移状态
npx prisma migrate status
```

### 生产环境

```bash
# 应用迁移（不会自动创建新迁移）
npx prisma migrate deploy

# 查看待应用的迁移
npx prisma migrate status
```

### 迁移命名规范

```
add_xxx          - 添加表/字段
update_xxx       - 修改表/字段
remove_xxx       - 删除表/字段
rename_xxx       - 重命名
add_index_xxx    - 添加索引
```

---

## 常见操作示例

### CRUD 操作

```typescript
// 创建
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: '张三',
  },
});

// 查询单条
const user = await prisma.user.findUnique({
  where: { id: 'xxx' },
});

// 查询列表（带分页）
const users = await prisma.user.findMany({
  where: { status: 1 },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// 更新
const user = await prisma.user.update({
  where: { id: 'xxx' },
  data: { name: '李四' },
});

// 删除
await prisma.user.delete({
  where: { id: 'xxx' },
});
```

### 关联查询

```typescript
// 查询用户及其文章
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'xxx' },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    },
    profile: true,
  },
});

// 只选择部分字段
const user = await prisma.user.findUnique({
  where: { id: 'xxx' },
  select: {
    id: true,
    name: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});
```

### 事务处理

```typescript
// 交互式事务
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com' },
  });

  const profile = await tx.profile.create({
    data: {
      userId: user.id,
      bio: '个人简介',
    },
  });

  return { user, profile };
});
```

---

## 常见错误处理

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| P2002 | 唯一约束冲突 | 检查是否有重复数据 |
| P2003 | 外键约束失败 | 检查关联数据是否存在 |
| P2025 | 记录不存在 | 使用 findUnique 前检查 |
| P1001 | 无法连接数据库 | 检查 DATABASE_URL |

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('邮箱已存在');
    }
  }
  throw error;
}
```

---

## 性能优化

### 索引建议
```prisma
model Post {
  // ...
  authorId String @map("author_id")

  // 添加索引
  @@index([authorId])
  @@index([createdAt])
  @@index([status, createdAt])  // 复合索引
}
```

### 避免 N+1 查询
```typescript
// ❌ N+1 问题
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  });
}

// ✅ 使用 include
const posts = await prisma.post.findMany({
  include: { author: true },
});
```
