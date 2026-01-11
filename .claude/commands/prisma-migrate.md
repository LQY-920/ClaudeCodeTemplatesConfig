---
description: Prisma 数据库迁移辅助
---

辅助执行 Prisma 数据库迁移操作，确保迁移安全可靠。

---

## 使用场景

- 修改了 `schema.prisma` 后需要生成迁移
- 需要查看迁移状态
- 需要应用或回滚迁移

---

## 执行流程

### 1. 检查当前状态

```bash
# 查看 schema.prisma 是否有未同步的变更
npx prisma migrate status
```

### 2. 确认变更内容

在执行迁移前，先确认 schema.prisma 的变更：
- 新增了哪些模型/字段
- 修改了哪些模型/字段
- 删除了哪些模型/字段（危险操作！）

### 3. 生成迁移

```bash
# 开发环境：创建迁移并应用
npx prisma migrate dev --name <migration_name>

# 迁移命名规范：
# add_user_table      - 添加表
# add_email_to_user   - 添加字段
# update_user_status  - 修改字段
# remove_old_field    - 删除字段
# add_index_on_email  - 添加索引
```

### 4. 验证结果

```bash
# 重新生成 Prisma Client
npx prisma generate

# 打开 Prisma Studio 查看数据
npx prisma studio
```

---

## 危险操作确认

以下操作需要用户明确确认：

### 删除字段/表
```
⚠️  警告：即将删除字段/表，这会导致数据永久丢失！
    - 删除字段：User.oldField
    - 影响数据量：约 1000 条记录

是否继续？(y/N)
```

### 重置数据库
```
⚠️  警告：即将重置数据库，所有数据将被清空！
    - 数据库：my_database
    - 表数量：15
    - 总数据量：约 50000 条记录

是否继续？(y/N)
```

---

## 常用命令速查

| 命令 | 说明 | 环境 |
|------|------|------|
| `npx prisma migrate dev` | 创建并应用迁移 | 开发 |
| `npx prisma migrate deploy` | 应用已有迁移 | 生产 |
| `npx prisma migrate reset` | 重置数据库 | 开发 |
| `npx prisma migrate status` | 查看迁移状态 | 通用 |
| `npx prisma generate` | 生成 Client | 通用 |
| `npx prisma studio` | 打开数据管理界面 | 开发 |
| `npx prisma format` | 格式化 schema | 通用 |
| `npx prisma validate` | 验证 schema | 通用 |

---

## 故障排查

### 迁移冲突
```bash
# 查看当前迁移状态
npx prisma migrate status

# 标记迁移为已应用（谨慎使用）
npx prisma migrate resolve --applied <migration_name>
```

### 数据库连接失败
```bash
# 检查 DATABASE_URL 环境变量
echo $DATABASE_URL

# 测试数据库连接
npx prisma db pull
```

### Client 不同步
```bash
# 重新生成 Client
npx prisma generate

# 重启开发服务器
```
