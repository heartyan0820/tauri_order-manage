<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("admin");
const password = ref("123456");
const loading = ref(false);
const errorMsg = ref("");

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = "请输入用户名和密码";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await authStore.login(username.value, password.value);
    router.push("/dashboard");
  } catch (e: any) {
    errorMsg.value = e.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <div class="login-logo">📦</div>
        <h1>订单管理系统</h1>
        <p>Order Management System</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </div>
        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? "登录中..." : "登 录" }}
        </button>
        <div class="login-tip">
          默认账号：admin / 123456
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 48px;
  margin-bottom: 12px;
}

.login-header h1 {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.login-header p {
  font-size: 13px;
  color: #909399;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #4f8cff;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
}

.login-error {
  background: #fef0f0;
  color: #f56c6c;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4f8cff 0%, #3a7bef 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-tip {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
