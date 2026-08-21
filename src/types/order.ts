// 订单相关类型定义

export type OrderStatus =
  | "pending"      // 待处理
  | "processing"   // 处理中
  | "shipped"      // 已发货
  | "completed"    // 已完成
  | "cancelled";   // 已取消

export type OrderType = "normal" | "urgent" | "return";

export interface OrderItem {
  id: string;
  productName: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  payableAmount: number;
  remark: string;
  createTime: string;
  payTime?: string;
  shipTime?: string;
  completeTime?: string;
}

export interface OrderQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: OrderStatus | "";
  type?: OrderType | "";
  startDate?: string;
  endDate?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyTrend: { date: string; count: number; revenue: number }[];
  statusDistribution: { status: OrderStatus; count: number }[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
