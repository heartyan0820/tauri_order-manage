<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { storeToRefs } from "pinia";
import { statusMap, typeMap } from "@/mock/data";
import type { Order, OrderStatus, OrderType } from "@/types/order";
import OrderForm from "@/components/OrderForm.vue";
import { exportOrdersToExcel } from "@/utils/excel";

const router = useRouter();
const store = useOrderStore();
const { orderList, total, loading, query, totalPages } = storeToRefs(store);

const showFilters = ref(false);
const showForm = ref(false);
const editingOrder = ref<Order | null>(null);
const exporting = ref(false);

onMounted(() => {
  store.fetchOrders();
});

watch(
  () => [query.value.page, query.value.pageSize],
  () => store.fetchOrders()
);

function search() {
  query.value.page = 1;
  store.fetchOrders();
}

function reset() {
  store.resetQuery();
  store.fetchOrders();
}

function goDetail(id: string) {
  router.push(`/orders/${id}`);
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  query.value.page = p;
}

function formatMoney(n: number): string {
  return "¥" + n.toFixed(2);
}

// 新增订单
function handleAdd() {
  editingOrder.value = null;
  showForm.value = true;
}

// 编辑订单
function handleEdit(order: Order) {
  editingOrder.value = order;
  showForm.value = true;
}

// 保存成功后刷新
function onFormSuccess() {
  store.fetchOrders();
}

// 导出Excel
async function handleExport() {
  exporting.value = true;
  try {
    // 导出当前页数据；如需导出全部，可先请求全量数据
    exportOrdersToExcel(orderList.value, `订单列表_第${query.value.page}页`);
  } finally {
    exporting.value = false;
  }
}

const statusOptions = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "shipped", label: "已发货" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

const typeOptions = [
  { value: "", label: "全部类型" },
  { value: "normal", label: "普通订单" },
  { value: "urgent", label: "加急订单" },
  { value: "return", label: "退货订单" },
];
</script>

<template>
  <!-- 搜索筛选 -->
  <div class="card" style="margin-bottom:16px;">
    <div class="form-row">
      <div class="form-item" style="flex:1;min-width:200px;">
        <input
          v-model="query.keyword"
          placeholder="搜索订单号/客户名/手机号"
          @keyup.enter="search"
        />
      </div>
      <button class="btn btn-primary" @click="search">🔍 搜索</button>
      <button class="btn btn-default" @click="reset">重置</button>
      <button class="btn btn-default mobile-only" @click="showFilters = !showFilters">
        {{ showFilters ? "收起筛选" : "更多筛选" }}
      </button>
      <div style="flex:1;"></div>
      <button class="btn btn-default" @click="handleExport" :disabled="exporting">
        {{ exporting ? "导出中..." : "📥 导出Excel" }}
      </button>
      <button class="btn btn-primary" @click="handleAdd">➕ 新增订单</button>
    </div>

    <!-- 高级筛选（桌面端常驻，移动端折叠） -->
    <div class="form-row" :class="{ 'mobile-only': !showFilters }" style="margin-bottom:0;">
      <div class="form-item">
        <label>状态</label>
        <select v-model="query.status" @change="search">
          <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="form-item">
        <label>类型</label>
        <select v-model="query.type" @change="search">
          <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="form-item desktop-only">
        <label>开始日期</label>
        <input type="date" v-model="query.startDate" @change="search" />
      </div>
      <div class="form-item desktop-only">
        <label>结束日期</label>
        <input type="date" v-model="query.endDate" @change="search" />
      </div>
    </div>
  </div>

  <!-- 桌面端表格 -->
  <div class="card desktop-only">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="orderList.length === 0" class="empty">暂无订单数据</div>
    <template v-else>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>商品</th>
              <th>数量</th>
              <th>金额</th>
              <th>类型</th>
              <th>状态</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orderList" :key="order.id" @click="goDetail(order.id)" style="cursor:pointer;">
              <td style="font-weight:600;">{{ order.orderNo }}</td>
              <td>{{ order.customerName }}<br /><span style="font-size:12px;color:var(--text-secondary);">{{ order.customerPhone }}</span></td>
              <td>{{ order.items[0]?.productName }}<span v-if="order.items.length > 1"> 等{{ order.items.length }}件</span></td>
              <td>{{ order.items.reduce((s, i) => s + i.quantity, 0) }}</td>
              <td style="color:var(--danger);font-weight:600;">{{ formatMoney(order.payableAmount) }}</td>
              <td>{{ typeMap[order.type] }}</td>
              <td>
                <span class="status-tag" :style="{ background: statusMap[order.status].color + '22', color: statusMap[order.status].color }">
                  {{ statusMap[order.status].label }}
                </span>
              </td>
              <td style="font-size:12px;">{{ order.createTime }}</td>
              <td @click.stop>
                <button class="btn-text" @click="goDetail(order.id)">详情</button>
                <button class="btn-text" @click="handleEdit(order)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <span>共 {{ total }} 条</span>
        <button @click="goPage(query.page - 1)" :disabled="query.page <= 1">上一页</button>
        <button
          v-for="p in Math.min(5, totalPages)"
          :key="p"
          :class="{ active: p === query.page }"
          @click="goPage(p)"
        >{{ p }}</button>
        <button @click="goPage(query.page + 1)" :disabled="query.page >= totalPages">下一页</button>
      </div>
    </template>
  </div>

  <!-- 移动端卡片列表 -->
  <div class="mobile-only">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="orderList.length === 0" class="empty">暂无订单数据</div>
    <div
      v-for="order in orderList"
      :key="order.id"
      class="order-card"
      @click="goDetail(order.id)"
    >
      <div class="order-card-header">
        <span class="order-card-no">{{ order.orderNo }}</span>
        <span class="status-tag" :style="{ background: statusMap[order.status].color + '22', color: statusMap[order.status].color }">
          {{ statusMap[order.status].label }}
        </span>
      </div>
      <div class="order-card-body">
        <span>客户：{{ order.customerName }}</span>
        <span>{{ typeMap[order.type] }}</span>
      </div>
      <div class="order-card-body">
        <span>{{ order.items[0]?.productName }}<span v-if="order.items.length > 1"> 等{{ order.items.length }}件</span></span>
        <span>共{{ order.items.reduce((s, i) => s + i.quantity, 0) }}件</span>
      </div>
      <div class="order-card-footer">
        <span class="order-amount">{{ formatMoney(order.payableAmount) }}</span>
        <span style="font-size:12px;color:var(--text-secondary);">{{ order.createTime }}</span>
      </div>
    </div>

    <!-- 移动端分页 -->
    <div class="pagination" style="justify-content:center;">
      <button @click="goPage(query.page - 1)" :disabled="query.page <= 1">上一页</button>
      <span>{{ query.page }} / {{ totalPages }}</span>
      <button @click="goPage(query.page + 1)" :disabled="query.page >= totalPages">下一页</button>
    </div>
  </div>

  <!-- 新增/编辑订单弹窗 -->
  <OrderForm
    v-model:visible="showForm"
    :order="editingOrder"
    @success="onFormSuccess"
  />
</template>
