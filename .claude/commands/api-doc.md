---
description: 生成 API 接口文档
---

根据代码自动生成或更新 API 接口文档。

---

## 使用场景

- 新增接口后需要更新文档
- 检查 Swagger 注解是否完整
- 生成接口文档供前端使用

---

## 执行流程

### 1. 检查 Swagger 注解

确保所有接口都有完整的 Swagger 注解：

```typescript
// Controller 级别
@ApiTags('模块名称')
@Controller('path')

// 接口级别
@ApiOperation({ summary: '接口描述' })
@ApiResponse({ status: 200, description: '成功响应描述' })
@ApiResponse({ status: 400, description: '错误响应描述' })
@ApiBearerAuth()  // 如果需要认证
```

### 2. 检查 DTO 注解

确保 DTO 字段都有完整的文档注解：

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: '字段描述',
    example: '示例值',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: '可选字段描述',
    default: '默认值',
  })
  @IsOptional()
  nickname?: string;
}
```

### 3. 启动服务查看文档

```bash
# 启动开发服务器
pnpm --filter server dev

# 访问 Swagger UI
# http://localhost:3000/api-docs
```

---

## 文档检查清单

### Controller 检查
- [ ] `@ApiTags()` - 模块标签
- [ ] `@ApiOperation()` - 每个接口的描述
- [ ] `@ApiResponse()` - 成功和错误响应
- [ ] `@ApiBearerAuth()` - 需要认证的接口
- [ ] `@ApiParam()` - 路径参数说明
- [ ] `@ApiQuery()` - 查询参数说明

### DTO 检查
- [ ] `@ApiProperty()` - 必填字段
- [ ] `@ApiPropertyOptional()` - 可选字段
- [ ] `description` - 字段描述
- [ ] `example` - 示例值
- [ ] `enum` - 枚举类型说明
- [ ] `type` - 复杂类型说明

---

## 输出格式

```markdown
## API 文档检查报告

### 模块：用户管理 (UserController)

| 接口 | 方法 | 路径 | Swagger 注解 | 状态 |
|------|------|------|--------------|------|
| 创建用户 | POST | /users | ✅ 完整 | OK |
| 获取列表 | GET | /users | ⚠️ 缺少响应描述 | 需补充 |
| 获取详情 | GET | /users/:id | ✅ 完整 | OK |

### DTO：CreateUserDto

| 字段 | 类型 | 描述 | 示例 | 状态 |
|------|------|------|------|------|
| email | string | ✅ | ✅ | OK |
| password | string | ✅ | ❌ | 需补充示例 |

### 建议

1. `UserController.findAll` 需要添加 `@ApiResponse` 描述分页响应格式
2. `CreateUserDto.password` 需要添加 `example` 属性
```

---

## Swagger 配置参考

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('API 文档')
  .setDescription('项目 API 接口文档')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('用户管理', '用户相关接口')
  .addTag('订单管理', '订单相关接口')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```
