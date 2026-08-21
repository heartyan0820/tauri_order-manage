import { get, post, put, del } from "./request";
import type { Order, OrderQuery, PageResult, DashboardStats } from "@/types/order";
import { mockOrders, statusMap } from "@/mock/data";

// 判断是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ========== Mock 实现 ==========
function mockGetOrders(query: OrderQuery): Promise<PageResult<Order>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = [...mockOrders];
      if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        list = list.filter(
          (o) =>
            o.orderNo.toLowerCase().includes(kw) ||
            o.customerName.toLowerCase().includes(kw) ||
            o.customerPhone.includes(kw)
        );
      }
      if (query.status) list = list.filter((o) => o.status === query.status);
      if (query.type) list = list.filter((o) => o.type === query.type);
      if (query.startDate) list = list.filter((o) => o.createTime >= query.startDate!);
      if (query.endDate) list = list.filter((o) => o.createTime <= query.endDate!);

      const total = list.length;
      const start = (query.page - 1) * query.pageSize;
      const pageList = list.slice(start, start + query.pageSize);
      resolve({ list: pageList, total, page: query.page, pageSize: query.pageSize });
    }, 300);
  });
}

function mockGetOrderDetail(id: string): Promise<Order | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockOrders.find((o) => o.id === id || o.orderNo === id) || null);
    }, 200);
  });
}

function mockGetDashboard(): Promise<DashboardStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date().toISOString().substring(0, 10);
      const todayOrders = mockOrders.filter((o) => o.createTime.startsWith(today));
      const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().substring(0, 10);
        const dayOrders = mockOrders.filter((o) => o.createTime.startsWith(dateStr));
        return {
          date: dateStr.substring(5),
          count: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + o.payableAmount, 0),
        };
      });
      const statusDistribution = (Object.keys(statusMap) as any[]).map((status) => ({
        status,
        count: mockOrders.filter((o) => o.status === status).length,
      }));
      resolve({
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter((o) => o.status === "pending").length,
        completedOrders: mockOrders.filter((o) => o.status === "completed").length,
        totalRevenue: mockOrders.reduce((s, o) => s + o.payableAmount, 0),
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + o.payableAmount, 0),
        weeklyTrend,
        statusDistribution,
      });
    }, 300);
  });
}

// ========== API 接口 ==========

// 订单列表
export function getOrders(query: OrderQuery): Promise<PageResult<Order>> {
  if (USE_MOCK) return mockGetOrders(query);
  return get<PageResult<Order>>("/orders", query);
}

// 订单详情
export function getOrderDetail(id: string): Promise<Order | null> {
  if (USE_MOCK) return mockGetOrderDetail(id);
  return get<Order>(`/orders/${id}`);
}

// 创建订单
export function createOrder(data: Partial<Order>): Promise<Order> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...data, id: `order-${Date.now()}`, orderNo: `ORD${Date.now()}` } as Order), 300);
    });
  }
  return post<Order>("/orders", data);
}

// 更新订单
export function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...data, id } as Order), 300);
    });
  }
  return put<Order>(`/orders/${id}`, data);
}

// 删除订单
export function deleteOrder(id: string): Promise<void> {
  if (USE_MOCK) return new Promise((resolve) => setTimeout(resolve, 200));
  return del<void>(`/orders/${id}`);
}

// 更新订单状态
export function updateOrderStatus(id: string, status: string): Promise<void> {
  if (USE_MOCK) return new Promise((resolve) => setTimeout(resolve, 200));
  return put<void>(`/orders/${id}/status`, { status });
}

// 仪表盘统计
export function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) return mockGetDashboard();
  return get<DashboardStats>("/dashboard/stats");
}
