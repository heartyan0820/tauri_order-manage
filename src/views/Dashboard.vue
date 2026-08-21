<script setup lang="ts">
import { onMounted } from "vue";
import { useOrderStore } from "@/stores/order";
import { storeToRefs } from "pinia";
import { statusMap } from "@/mock/data";

const store = useOrderStore();
const { dashboard, loading } = storeToRefs(store);

onMounted(() => {
  store.fetchDashboard();
});

function formatMoney(n: number): string {
  return "¥" + n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maxCount(): number {
  if (!dashboard.value) return 1;
  return Math.max(...dashboard.value.weeklyTrend.map((t) => t.count), 1);
}
</script>

<template>
  <div v-if="loading && !dashboard" class="loading">加载中...</div>

  <template v-else-if="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总订单数</div>
        <div class="stat-value">{{ dashboard.totalOrders }}</div>
        <div class="stat-sub">今日新增 {{ dashboard.todayOrders }} 单</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待处理订单</div>
        <div class="stat-value">{{ dashboard.pendingOrders }}</div>
        <div class="stat-sub">需要及时处理</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">已完成订单</div>
        <div class="stat-value">{{ dashboard.completedOrders }}</div>
        <div class="stat-sub">完成率 {{ Math.round((dashboard.completedOrders / dashboard.totalOrders) * 100) }}%</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">总营收</div>
        <div class="stat-value">{{ formatMoney(dashboard.totalRevenue) }}</div>
        <div class="stat-sub">今日营收 {{ formatMoney(dashboard.todayRevenue) }}</div>
      </div>
    </div>

    <!-- 近7天趋势 -->
    <div class="card">
      <div class="card-title">近 7 天订单趋势</div>
      <div class="chart-container">
        <div
          v-for="item in dashboard.weeklyTrend"
          :key="item.date"
          class="chart-bar-group"
        >
          <div style="font-size:11px;color:var(--text-secondary);">{{ item.count }}</div>
          <div
            class="chart-bar"
            :style="{ height: (item.count / maxCount()) * 120 + 'px' }"
          ></div>
          <div class="chart-label">{{ item.date }}</div>
        </div>
      </div>
    </div>

    <!-- 状态分布 -->
    <div class="card">
      <div class="card-title">订单状态分布</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div
          v-for="item in dashboard.statusDistribution"
          :key="item.status"
          style="flex:1;min-width:120px;text-align:center;padding:16px;background:#fafafa;border-radius:8px;"
        >
          <div
            class="status-tag"
            :style="{ background: statusMap[item.status].color + '22', color: statusMap[item.status].color }"
          >
            {{ statusMap[item.status].label }}
          </div>
          <div style="font-size:24px;font-weight:700;margin-top:8px;">{{ item.count }}</div>
        </div>
      </div>
    </div>
  </template>
</template>
