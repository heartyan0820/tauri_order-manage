import type { Order, OrderStatus, OrderType } from "@/types/order";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "completed", "cancelled"];
const types: OrderType[] = ["normal", "normal", "normal", "urgent", "return"];

const products = [
  { name: "纯钛烤瓷牙", spec: "左上1", price: 120 },
  { name: "无铍无镍金属烤瓷冠", spec: "右下6", price: 180 },
  { name: "激光熔融钴铬烤瓷冠", spec: "左下3", price: 260 },
  { name: "国产全瓷牙", spec: "右上2", price: 350 },
  { name: "进口全瓷牙", spec: "正中4", price: 580 },
  { name: "树脂贴面", spec: "上前牙区", price: 80 },
  { name: "泰利斯液态打印氧化锆", spec: "全口", price: 1200 },
  { name: "种植导板", spec: "半口", price: 800 },
  { name: "正畸保持器", spec: "上下颌", price: 300 },
  { name: "数字化服务", spec: "3D扫描", price: 150 },
];

const customers = [
  { name: "张三", phone: "138****1234", address: "成都市武侯区人民南路1号" },
  { name: "李四", phone: "139****5678", address: "成都市锦江区春熙路88号" },
  { name: "王五", phone: "137****9012", address: "成都市青羊区天府广场5号" },
  { name: "赵六", phone: "136****3456", address: "成都市高新区天府大道100号" },
  { name: "钱七", phone: "135****7890", address: "成都市成华区建设路20号" },
  { name: "孙八", phone: "134****2345", address: "成都市金牛区沙湾路66号" },
  { name: "周九", phone: "133****6789", address: "成都市龙泉驿区成龙大道1号" },
  { name: "吴十", phone: "132****0123", address: "成都市双流区东升街道30号" },
];

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString().replace("T", " ").substring(0, 19);
}

function generateOrder(index: number): Order {
  const customer = customers[index % customers.length];
  const itemCount = 1 + Math.floor(Math.random() * 3);
  const items = Array.from({ length: itemCount }, () => {
    const p = products[Math.floor(Math.random() * products.length)];
    const qty = 1 + Math.floor(Math.random() * 4);
    return {
      id: `item-${index}-${Math.random().toString(36).slice(2, 8)}`,
      productName: p.name,
      spec: p.spec,
      quantity: qty,
      unitPrice: p.price,
      subtotal: p.price * qty,
    };
  });
  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
  const shippingFee = totalAmount > 500 ? 0 : 15;
  const discount = Math.random() > 0.7 ? Math.floor(totalAmount * 0.1) : 0;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const createTime = randomDate(30);

  return {
    id: `order-${10000 + index}`,
    orderNo: `ORD${new Date().getFullYear()}${String(10000 + index).padStart(6, "0")}`,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,
    status,
    type: types[Math.floor(Math.random() * types.length)],
    items,
    totalAmount,
    shippingFee,
    discount,
    payableAmount: totalAmount + shippingFee - discount,
    remark: Math.random() > 0.5 ? "客户要求尽快发货" : "",
    createTime,
    payTime: status !== "pending" ? createTime : undefined,
    shipTime: ["shipped", "completed"].includes(status) ? createTime : undefined,
    completeTime: status === "completed" ? createTime : undefined,
  };
}

export const mockOrders: Order[] = Array.from({ length: 86 }, (_, i) => generateOrder(i));

export const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "待处理", color: "#e6a23c" },
  processing: { label: "处理中", color: "#409eff" },
  shipped: { label: "已发货", color: "#909399" },
  completed: { label: "已完成", color: "#67c23a" },
  cancelled: { label: "已取消", color: "#f56c6c" },
};

export const typeMap: Record<OrderType, string> = {
  normal: "普通订单",
  urgent: "加急订单",
  return: "退货订单",
};
