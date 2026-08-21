import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Order, OrderQuery, PageResult, DashboardStats } from "@/types/order";
import { getOrders, getOrderDetail, getDashboardStats, updateOrderStatus } from "@/api/order";

export const useOrderStore = defineStore("order", () => {
  // 订单列表
  const orderList = ref<Order[]>([]);
  const total = ref(0);
  const loading = ref(false);

  // 订单详情
  const currentOrder = ref<Order | null>(null);

  // 仪表盘
  const dashboard = ref<DashboardStats | null>(null);

  // 查询参数
  const query = ref<OrderQuery>({
    page: 1,
    pageSize: 10,
    keyword: "",
    status: "",
    type: "",
  });

  const totalPages = computed(() => Math.ceil(total.value / query.value.pageSize));

  // 获取订单列表
  async function fetchOrders() {
    loading.value = true;
    try {
      const res: PageResult<Order> = await getOrders(query.value);
      orderList.value = res.list;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  // 获取订单详情
  async function fetchOrderDetail(id: string) {
    loading.value = true;
    try {
      currentOrder.value = await getOrderDetail(id);
    } finally {
      loading.value = false;
    }
  }

  // 获取仪表盘
  async function fetchDashboard() {
    loading.value = true;
    try {
      dashboard.value = await getDashboardStats();
    } finally {
      loading.value = false;
    }
  }

  // 更新订单状态
  async function changeOrderStatus(id: string, status: string) {
    await updateOrderStatus(id, status);
    await fetchOrders();
  }

  // 重置查询
  function resetQuery() {
    query.value = { page: 1, pageSize: 10, keyword: "", status: "", type: "" };
  }

  return {
    orderList,
    total,
    loading,
    currentOrder,
    dashboard,
    query,
    totalPages,
    fetchOrders,
    fetchOrderDetail,
    fetchDashboard,
    changeOrderStatus,
    resetQuery,
  };
});
