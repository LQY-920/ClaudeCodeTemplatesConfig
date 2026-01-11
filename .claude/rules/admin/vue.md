---
paths: apps/admin/**/*.{ts,tsx,vue}
---

# Vue 3 管理后台开发规范

本规则仅在编辑 `apps/admin/` 下的 Vue/TypeScript 文件时生效。

---

## 技术栈

- **Vue 3** - 组合式 API（Composition API）
- **Vite** - 构建工具
- **TypeScript** - 严格模式
- **vue-router** - 路由管理
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库
- **axios** - HTTP 客户端
- **@pureadmin/\*** - Pure Admin 相关组件
- **@vueuse/motion** - 动画库
- **unplugin-icons** - 图标按需加载

---

## 类型安全

### 禁止使用 any
```typescript
// ❌ 禁止
const data: any = response.data;
function handle(params: any) {}

// ✅ 正确
interface UserData {
  id: string;
  name: string;
}
const data: UserData = response.data;
function handle(params: UserParams) {}
```

### 使用 type 而非 interface（除非需要扩展）
```typescript
// ✅ 推荐：使用 type
type UserRole = 'admin' | 'user' | 'guest';

type UserInfo = {
  id: string;
  name: string;
  role: UserRole;
};

// ✅ 需要扩展时使用 interface
interface BaseEntity {
  id: string;
  createdAt: string;
}

interface User extends BaseEntity {
  name: string;
}
```

---

## 组件规范

### 单文件组件结构
```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

// 2. Props & Emits
interface Props {
  userId: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

const emit = defineEmits<{
  update: [value: string];
  submit: [];
}>();

// 3. 组合式函数
const userStore = useUserStore();

// 4. 响应式状态
const loading = ref(false);
const formData = ref({
  name: '',
  email: '',
});

// 5. 计算属性
const isValid = computed(() => {
  return formData.value.name && formData.value.email;
});

// 6. 方法
async function handleSubmit() {
  loading.value = true;
  try {
    await userStore.updateUser(props.userId, formData.value);
    emit('submit');
  } finally {
    loading.value = false;
  }
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<template>
  <div class="user-form">
    <el-form :model="formData" :disabled="readonly">
      <el-form-item label="姓名">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.user-form {
  padding: 20px;
}
</style>
```

---

## Pinia Store 规范

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserInfo, login, logout } from '@/api/user';
import type { UserInfo, LoginParams } from '@/api/user/types';

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<UserInfo | null>(null);

  // Getters
  const isLoggedIn = computed(() => !!token.value);
  const userName = computed(() => userInfo.value?.name ?? '游客');

  // Actions
  async function loginAction(params: LoginParams) {
    const { data } = await login(params);
    token.value = data.token;
    localStorage.setItem('token', data.token);
    await fetchUserInfo();
  }

  async function fetchUserInfo() {
    const { data } = await getUserInfo();
    userInfo.value = data;
  }

  async function logoutAction() {
    await logout();
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    loginAction,
    fetchUserInfo,
    logoutAction,
  };
});
```

---

## API 接口规范

```typescript
// api/user/index.ts
import request from '@/utils/request';
import type { UserInfo, LoginParams, LoginResult, UserListParams, UserListResult } from './types';

// 用户登录
export function login(params: LoginParams) {
  return request.post<LoginResult>('/auth/login', params);
}

// 获取用户信息
export function getUserInfo() {
  return request.get<UserInfo>('/user/info');
}

// 获取用户列表
export function getUserList(params: UserListParams) {
  return request.get<UserListResult>('/users', { params });
}

// 更新用户
export function updateUser(id: string, data: Partial<UserInfo>) {
  return request.put<UserInfo>(`/users/${id}`, data);
}

// 删除用户
export function deleteUser(id: string) {
  return request.delete(`/users/${id}`);
}
```

```typescript
// api/user/types.ts
export type UserInfo = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  expiresIn: number;
};

export type UserListParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
};

export type UserListResult = {
  items: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
};
```

---

## 路由规范

```typescript
// router/modules/user.ts
import type { RouteRecordRaw } from 'vue-router';

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/default.vue'),
    meta: {
      title: '用户管理',
      icon: 'user',
      requiresAuth: true,
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: {
          title: '用户列表',
        },
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/user/detail.vue'),
        meta: {
          title: '用户详情',
          hidden: true, // 不显示在菜单中
        },
      },
    ],
  },
];

export default userRoutes;
```

---

## Element Plus 使用规范

### 表格
```vue
<template>
  <el-table :data="tableData" v-loading="loading" border>
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="email" label="邮箱" min-width="180" />
    <el-table-column prop="createdAt" label="创建时间" width="180">
      <template #default="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-popconfirm title="确定删除吗？" @confirm="handleDelete(row.id)">
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    v-model:current-page="pagination.page"
    v-model:page-size="pagination.pageSize"
    :total="pagination.total"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next, jumper"
    @change="fetchData"
  />
</template>
```

### 表单
```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="用户名" prop="name">
      <el-input v-model="formData.name" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="formData.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
};

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (valid) {
    // 提交逻辑
  }
}

function handleReset() {
  formRef.value?.resetFields();
}
</script>
```

---

## 校验命令

```bash
# 类型检查
pnpm --filter admin exec tsc -b --noEmit

# ESLint 检查
pnpm --filter admin lint --fix

# 启动开发服务器
pnpm --filter admin dev

# 构建生产版本
pnpm --filter admin build
```
