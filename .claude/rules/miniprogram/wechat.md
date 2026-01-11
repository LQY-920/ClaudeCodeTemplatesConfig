---
paths: apps/miniprogram/**/*.{js,json,wxml,wxss}
---

# 微信小程序开发规范

本规则仅在编辑 `apps/miniprogram/` 下的小程序文件时生效。

---

## 技术栈

- **微信小程序原生** - WXML/WXSS/JavaScript
- **微信小程序 API** - wx.login、wx.request 等
- **组件化开发** - 自定义组件

---

## 目录结构

```
miniprogram/
├── pages/                 # 页面
│   ├── index/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── user/
│       └── ...
├── components/            # 公共组件
│   ├── navbar/
│   └── loading/
├── utils/                 # 工具函数
│   ├── request.js         # 网络请求封装
│   ├── auth.js            # 登录授权
│   └── util.js            # 通用工具
├── services/              # 业务接口
│   ├── user.js
│   └── order.js
├── images/                # 图片资源
├── styles/                # 公共样式
│   └── common.wxss
├── app.js                 # 小程序入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
└── project.config.json    # 项目配置
```

---

## 页面规范

### 页面 JS
```javascript
// pages/user/index.js
const userService = require('../../services/user');
const app = getApp();

Page({
  /**
   * 页面初始数据
   */
  data: {
    userInfo: null,
    loading: true,
    orderList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchUserInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.fetchUserInfo();
    wx.stopPullDownRefresh();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    this.loadMoreOrders();
  },

  /**
   * 获取用户信息
   */
  async fetchUserInfo() {
    try {
      this.setData({ loading: true });
      const userInfo = await userService.getUserInfo();
      this.setData({ userInfo });
    } catch (error) {
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 处理点击事件
   */
  handleTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail?id=${id}`,
    });
  },
});
```

### 页面 WXML
```xml
<!-- pages/user/index.wxml -->
<view class="container">
  <!-- 加载状态 -->
  <loading wx:if="{{loading}}" />

  <!-- 用户信息 -->
  <view wx:else class="user-card">
    <image class="avatar" src="{{userInfo.avatar}}" mode="aspectFill" />
    <view class="info">
      <text class="name">{{userInfo.name}}</text>
      <text class="phone">{{userInfo.phone}}</text>
    </view>
  </view>

  <!-- 订单列表 -->
  <view class="order-list">
    <view
      wx:for="{{orderList}}"
      wx:key="id"
      class="order-item"
      data-id="{{item.id}}"
      bindtap="handleTap"
    >
      <text class="order-no">订单号：{{item.orderNo}}</text>
      <text class="amount">¥{{item.amount}}</text>
    </view>
  </view>

  <!-- 空状态 -->
  <view wx:if="{{!loading && orderList.length === 0}}" class="empty">
    <text>暂无订单</text>
  </view>
</view>
```

### 页面 WXSS
```css
/* pages/user/index.wxss */
@import '../../styles/common.wxss';

.container {
  padding: 20rpx;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.info .name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.info .phone {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.order-list {
  margin-top: 30rpx;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
```

---

## 网络请求封装

```javascript
// utils/request.js
const app = getApp();
const BASE_URL = 'https://api.example.com';

/**
 * 封装的网络请求
 * @param {Object} options - 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header,
      },
      success(res) {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          wx.removeStorageSync('token');
          wx.navigateTo({ url: '/pages/login/index' });
          reject(new Error('登录已过期'));
        } else {
          reject(new Error(`请求失败：${res.statusCode}`));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'));
      },
    });
  });
}

/**
 * GET 请求
 */
function get(url, data) {
  return request({ url, method: 'GET', data });
}

/**
 * POST 请求
 */
function post(url, data) {
  return request({ url, method: 'POST', data });
}

/**
 * PUT 请求
 */
function put(url, data) {
  return request({ url, method: 'PUT', data });
}

/**
 * DELETE 请求
 */
function del(url, data) {
  return request({ url, method: 'DELETE', data });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
};
```

---

## 登录授权

```javascript
// utils/auth.js
const request = require('./request');

/**
 * 微信登录
 * @returns {Promise<string>} token
 */
async function login() {
  // 1. 调用 wx.login 获取 code
  const { code } = await new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject,
    });
  });

  // 2. 发送 code 到服务端换取 token
  const { token } = await request.post('/auth/wechat-login', { code });

  // 3. 保存 token
  wx.setStorageSync('token', token);

  return token;
}

/**
 * 检查登录状态
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!wx.getStorageSync('token');
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
}

/**
 * 登录态检查装饰器（在页面中使用）
 */
function requireAuth(pageConfig) {
  const originalOnLoad = pageConfig.onLoad;

  pageConfig.onLoad = function (options) {
    if (!isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }

    if (originalOnLoad) {
      originalOnLoad.call(this, options);
    }
  };

  return pageConfig;
}

module.exports = {
  login,
  isLoggedIn,
  logout,
  requireAuth,
};
```

---

## 自定义组件

```javascript
// components/loading/loading.js
Component({
  properties: {
    text: {
      type: String,
      value: '加载中...',
    },
    size: {
      type: String,
      value: 'default', // small | default | large
    },
  },

  data: {},

  methods: {},
});
```

```xml
<!-- components/loading/loading.wxml -->
<view class="loading-container loading-{{size}}">
  <view class="loading-spinner"></view>
  <text class="loading-text">{{text}}</text>
</view>
```

```json
// components/loading/loading.json
{
  "component": true
}
```

---

## 注意事项

### 性能优化
- `setData` 数据量不宜过大，超过 1MB 会显著影响性能
- 列表渲染使用 `wx:key` 提高渲染性能
- 图片使用合适尺寸，避免过大
- 避免频繁调用 `setData`，可合并更新

### 用户体验
- 网络请求添加 loading 状态
- 错误提示友好清晰
- 支持下拉刷新和上拉加载
- 页面切换添加过渡动画

### 安全规范
- 敏感数据不存储在本地（如密码）
- Token 使用 Storage 存储，不用全局变量
- 用户输入需要校验
- 接口使用 HTTPS

---

## 调试技巧

```javascript
// 打印当前页面数据
console.log('页面数据：', this.data);

// 查看全局数据
console.log('全局数据：', getApp().globalData);

// 查看 Storage
console.log('Token：', wx.getStorageSync('token'));

// 性能监控
wx.reportPerformance(1001, Date.now() - startTime);
```
