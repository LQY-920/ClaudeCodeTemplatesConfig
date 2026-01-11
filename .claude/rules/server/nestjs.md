---
paths: apps/server/**/*.ts
---

# NestJS 服务端开发规范

本规则仅在编辑 `apps/server/` 下的 TypeScript 文件时生效。

---

## 技术栈

- **NestJS** - Node.js 服务端框架
- **TypeScript** - 严格模式
- **Prisma** - ORM，MySQL 数据库
- **class-validator** - DTO 验证
- **class-transformer** - 数据转换
- **@nestjs/swagger** - API 文档
- **@nestjs/jwt** + **passport-jwt** - JWT 认证
- **@nestjs/throttler** - 限流

---

## 分层架构

```
┌─────────────────────────────────────────┐
│              Controller                  │  ← 处理 HTTP 请求
├─────────────────────────────────────────┤
│               Service                    │  ← 业务逻辑
├─────────────────────────────────────────┤
│              Repository                  │  ← 数据访问（可选）
├─────────────────────────────────────────┤
│           Prisma Client                  │  ← ORM
└─────────────────────────────────────────┘
```

### 各层职责

| 层 | 职责 | 注意事项 |
|----|------|----------|
| **Controller** | 处理请求、参数验证、响应封装 | 不写业务逻辑 |
| **Service** | 业务逻辑、事务管理 | 可注入多个 Repository |
| **Repository** | 数据库操作封装（可选） | 复杂查询可抽离 |

---

## 模块结构

```
modules/
└── user/
    ├── user.module.ts         # 模块定义
    ├── user.controller.ts     # 控制器
    ├── user.service.ts        # 服务
    ├── dto/
    │   ├── create-user.dto.ts # 创建 DTO
    │   └── update-user.dto.ts # 更新 DTO
    ├── entities/
    │   └── user.entity.ts     # 实体（响应类型）
    └── user.repository.ts     # 仓库（可选）
```

---

## DTO 规范

### 创建 DTO
```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '用户密码', minLength: 8 })
  @IsString()
  @MinLength(8, { message: '密码至少8位' })
  password: string;

  @ApiPropertyOptional({ description: '用户昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;
}
```

### 更新 DTO
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## Controller 规范

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: '获取用户详情' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
```

---

## Service 规范

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // 密码加密
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, pageSize = 10, keyword } = query;

    const where = keyword
      ? {
          OR: [
            { email: { contains: keyword } },
            { nickname: { contains: keyword } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          nickname: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
```

---

## 异常处理

### 业务异常
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

// 使用内置异常类
throw new NotFoundException('用户不存在');
throw new BadRequestException('参数错误');
throw new UnauthorizedException('未授权');
throw new ForbiddenException('无权限');

// 自定义业务异常
throw new HttpException(
  { code: 'USER_ALREADY_EXISTS', message: '用户已存在' },
  HttpStatus.CONFLICT,
);
```

### 全局异常过滤器
```typescript
// 在 common/filters/http-exception.filter.ts 中已配置
// 统一响应格式：{ code, message, data }
```

---

## 校验命令

```bash
# 类型检查
npx tsc -b apps/server --noEmit

# ESLint 检查
npx eslint apps/server --ext .ts --fix

# 运行测试
pnpm --filter server test

# 启动开发服务器
pnpm --filter server dev
```

---

## 常见模式

### 事务处理
```typescript
async transferMoney(fromId: string, toId: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    // 扣款
    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    // 入账
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    // 记录流水
    await tx.transaction.create({
      data: { fromId, toId, amount },
    });
  });
}
```

### 软删除
```typescript
// schema.prisma
model User {
  deletedAt DateTime?
}

// service
async softDelete(id: string) {
  return this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// 查询时过滤
const users = await this.prisma.user.findMany({
  where: { deletedAt: null },
});
```
