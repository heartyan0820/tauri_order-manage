import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录", requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("@/views/Layout.vue"),
    redirect: "/dashboard",
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { title: "数据概览", icon: "📊" },
      },
      {
        path: "orders",
        name: "OrderList",
        component: () => import("@/views/OrderList.vue"),
        meta: { title: "订单管理", icon: "📦" },
      },
      {
        path: "orders/:id",
        name: "OrderDetail",
        component: () => import("@/views/OrderDetail.vue"),
        meta: { title: "订单详情", icon: "📋", hidden: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 全局路由守卫：登录鉴权
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || "订单管理系统";
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth !== false);

  if (requiresAuth && !authStore.isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if (to.path === "/login" && authStore.isLoggedIn) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
