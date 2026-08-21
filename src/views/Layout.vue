<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { sendNotification, requestNotifyPermission } from "@/utils/notify";
import { useOrderStore } from "@/stores/order";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

const menus = [
  { path: "/dashboard", title: "数据概览", icon: "📊" },
  { path: "/orders", title: "订单管理", icon: "📦" },
];

const currentTitle = computed(() => (route.meta.title as string) || "订单管理系统");
const showUserMenu = ref(false);
let pollTimer: any = null;
let lastOrderCount = 0;

function navigate(path: string) {
  router.push(path);
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

// 新订单轮询 + 桌面通知
async function startOrderPolling() {
  await requestNotifyPermission();
  lastOrderCount = orderStore.total;
  pollTimer = setInterval(async () => {
    const prev = lastOrderCount;
    await orderStore.fetchOrders();
    if (orderStore.total > prev) {
      const newCount = orderStore.total - prev;
      sendNotification("新订单提醒", `您有 ${newCount} 个新订单待处理`);
    }
    lastOrderCount = orderStore.total;
  }, 30000); // 每30秒轮询一次
}

onMounted(() => {
  startOrderPolling();
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="layout">
    <!-- 桌面端侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">📦 订单管理</div>
      <nav class="sidebar-menu">
        <div
          v-for="m in menus"
          :key="m.path"
          class="menu-item"
          :class="{ active: route.path.startsWith(m.path) }"
          @click="navigate(m.path)"
        >
          <span class="menu-icon">{{ m.icon }}</span>
          <span>{{ m.title }}</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-title">{{ currentTitle }}</div>
        <div class="topbar-user" style="position:relative;">
          <div class="avatar" @click="showUserMenu = !showUserMenu" style="cursor:pointer;">
            {{ authStore.userInfo?.name?.charAt(0) || "管" }}
          </div>
          <span class="desktop-only" @click="showUserMenu = !showUserMenu" style="cursor:pointer;">
            {{ authStore.userInfo?.name || "管理员" }}
          </span>
          <div v-if="showUserMenu" class="user-dropdown" @click.stop>
            <div class="user-dropdown-item" @click="handleLogout">🚪 退出登录</div>
          </div>
        </div>
      </header>
      <main class="page-content">
        <RouterView />
      </main>
    </div>

    <!-- 移动端底部导航 -->
    <nav class="bottom-nav">
      <div
        v-for="m in menus"
        :key="m.path"
        class="bottom-nav-item"
        :class="{ active: route.path.startsWith(m.path) }"
        @click="navigate(m.path)"
      >
        <span class="bottom-nav-icon">{{ m.icon }}</span>
        <span>{{ m.title }}</span>
      </div>
    </nav>
  </div>
</template>
