---
name: api
description: "API 开发辅助。触发词：api、接口、controller、service、crud..."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npx*)
---

# API 开发辅助技能

专用于 NestJS API 接口开发、CRUD 生成和接口设计。

---

## 触发场景

- 创建新的 API 接口
- 实现 CRUD 功能
- 设计 RESTful API
- 生成 Swagger 文档

---

## API 开发流程

### 1. 需求分析

确认以下信息：
- 资源名称（如：用户、文章、订单）
- 需要哪些接口（CRUD 全部 or 部分）
- 是否需要认证
- 是否需要分页
- 特殊业务逻辑

### 2. 创建模块结构

```bash
# 使用 NestJS CLI 创建模块
npx nest g module modules/user
npx nest g controller modules/user
npx nest g service modules/user
```

或手动创建：

```
modules/
└── user/
    ├── user.module.ts
    ├── user.controller.ts
    ├── user.service.ts
    └── dto/
        ├── create-user.dto.ts
        ├── update-user.dto.ts
        └── query-user.dto.ts
```

### 3. 实现各层代码

---

## 代码模板

### Module

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### Controller

```typescript
// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

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

  @ApiOperation({ summary: '更新用户' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

### Service

```typescript
// user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // 检查邮箱是否已存在
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('邮箱已存在');
    }

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
        name: true,
        createdAt: true,
      },
    });
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, pageSize = 10, keyword, status } = query;

    const where = {
      deletedAt: null,
      ...(status !== undefined && { status }),
      ...(keyword && {
        OR: [
          { email: { contains: keyword } },
          { name: { contains: keyword } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // 检查是否存在

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // 检查是否存在

    // 软删除
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

### DTO

```typescript
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', minLength: 8 })
  @IsString()
  @MinLength(8, { message: '密码至少8位' })
  password: string;

  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;
}
```

```typescript
// dto/update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {}
```

```typescript
// dto/query-user.dto.ts
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态', enum: [0, 1] })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
```

---

## RESTful 设计规范

| 操作 | HTTP 方法 | 路径 | 状态码 |
|------|-----------|------|--------|
| 列表 | GET | /resources | 200 |
| 详情 | GET | /resources/:id | 200 |
| 创建 | POST | /resources | 201 |
| 更新 | PUT | /resources/:id | 200 |
| 删除 | DELETE | /resources/:id | 204 |

---

## 响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 分页响应
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}

// 错误响应
{
  "code": 40001,
  "message": "参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ]
}
```
