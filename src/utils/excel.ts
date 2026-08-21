import * as XLSX from "xlsx";
import type { Order } from "@/types/order";
import { statusMap, typeMap } from "@/mock/data";

/**
 * 导出订单列表为 Excel
 * @param orders 订单数据
 * @param filename 文件名（不含扩展名）
 */
export function exportOrdersToExcel(orders: Order[], filename = "订单列表") {
  // 转换为扁平行
  const rows = orders.map((o) => ({
    订单号: o.orderNo,
    客户姓名: o.customerName,
    联系电话: o.customerPhone,
    收货地址: o.customerAddress,
    商品: o.items.map((i) => i.productName).join("、"),
    规格: o.items.map((i) => i.spec).join("、"),
    总数量: o.items.reduce((s, i) => s + i.quantity, 0),
    商品总额: o.totalAmount.toFixed(2),
    运费: o.shippingFee.toFixed(2),
    优惠: o.discount.toFixed(2),
    实付金额: o.payableAmount.toFixed(2),
    订单类型: typeMap[o.type],
    订单状态: statusMap[o.status].label,
    下单时间: o.createTime,
    支付时间: o.payTime || "",
    发货时间: o.shipTime || "",
    备注: o.remark || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // 设置列宽
  ws["!cols"] = [
    { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 30 },
    { wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 10 },
    { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "订单列表");

  // 导出文件（Web端直接下载，桌面端可配合Tauri保存到指定路径）
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  XLSX.writeFile(wb, `${filename}_${ts}.xlsx`);
}
