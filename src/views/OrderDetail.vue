<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "@/stores/order";
import { storeToRefs } from "pinia";
import { statusMap, typeMap } from "@/mock/data";

const route = useRoute();
const router = useRouter();
const store = useOrderStore();
const { currentOrder, loading } = storeToRefs(store);

onMounted(() => {
  const id = route.params.id as string;
  store.fetchOrderDetail(id);
});

function formatMoney(n: number): string {
  return "¥" + n.toFixed(2);
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="back-btn" @click="goBack">← 返回列表</div>

  <div v-if="loading" class="loading">加载中...</div>

  <template v-else-if="currentOrder">
    <!-- 订单基本信息 -->
    <div class="card">
      <div class="detail-section">
        <div class="detail-section-title">订单信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">订单号：</span>
            <span class="detail-value" style="font-weight:600;">{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单状态：</span>
            <span class="detail-value">
              <span class="status-tag" :style="{ background: statusMap[currentOrder.status].color + '22', color: statusMap[currentOrder.status].color }">
                {{ statusMap[currentOrder.status].label }}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">订单类型：</span>
            <span class="detail-value">{{ typeMap[currentOrder.type] }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">下单时间：</span>
            <span class="detail-value">{{ currentOrder.createTime }}</span>
          </div>
          <div class="detail-item" v-if="currentOrder.payTime">
            <span class="detail-label">支付时间：</span>
            <span class="detail-value">{{ currentOrder.payTime }}</span>
          </div>
          <div class="detail-item" v-if="currentOrder.shipTime">
            <span class="detail-label">发货时间：</span>
            <span class="detail-value">{{ currentOrder.shipTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 客户信息 -->
    <div class="card">
      <div class="detail-section">
        <div class="detail-section-title">客户信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">客户姓名：</span>
            <span class="detail-value">{{ currentOrder.customerName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value">{{ currentOrder.customerPhone }}</span>
          </div>
          <div class="detail-item" style="grid-column: 1 / -1;">
            <span class="detail-label">收货地址：</span>
            <span class="detail-value">{{ currentOrder.customerAddress }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品明细 -->
    <div class="card">
      <div class="detail-section">
        <div class="detail-section-title">商品明细</div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>商品名称</th>
                <th>规格</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in currentOrder.items" :key="item.id">
                <td>{{ item.productName }}</td>
                <td>{{ item.spec }}</td>
                <td>{{ formatMoney(item.unitPrice) }}</td>
                <td>{{ item.quantity }}</td>
                <td style="font-weight:600;">{{ formatMoney(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 金额汇总 -->
    <div class="card">
      <div class="detail-section">
        <div class="detail-section-title">金额汇总</div>
        <div style="max-width:300px;margin-left:auto;">
          <div class="detail-item" style="margin-bottom:8px;">
            <span class="detail-label">商品总额：</span>
            <span class="detail-value" style="text-align:right;">{{ formatMoney(currentOrder.totalAmount) }}</span>
          </div>
          <div class="detail-item" style="margin-bottom:8px;">
            <span class="detail-label">运费：</span>
            <span class="detail-value" style="text-align:right;">{{ formatMoney(currentOrder.shippingFee) }}</span>
          </div>
          <div class="detail-item" style="margin-bottom:8px;">
            <span class="detail-label">优惠：</span>
            <span class="detail-value" style="text-align:right;color:var(--success);">-{{ formatMoney(currentOrder.discount) }}</span>
          </div>
          <div class="detail-item" style="padding-top:8px;border-top:1px solid var(--border);">
            <span class="detail-label" style="font-weight:600;">实付金额：</span>
            <span class="detail-value" style="text-align:right;font-size:18px;font-weight:700;color:var(--danger);">
              {{ formatMoney(currentOrder.payableAmount) }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="currentOrder.remark" class="detail-item" style="margin-top:12px;">
        <span class="detail-label">备注：</span>
        <span class="detail-value">{{ currentOrder.remark }}</span>
      </div>
    </div>
  </template>

  <div v-else class="empty">订单不存在</div>
</template>
