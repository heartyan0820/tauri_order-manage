<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import type { Order, OrderItem, OrderStatus, OrderType } from "@/types/order";
import { createOrder, updateOrder } from "@/api/order";

const props = defineProps<{
  visible: boolean;
  order?: Order | null; // 有值=编辑，无值=新增
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);
const errorMsg = ref("");

const form = reactive({
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  status: "pending" as OrderStatus,
  type: "normal" as OrderType,
  remark: "",
  items: [] as OrderItem[],
});

const isEdit = computed(() => !!props.order);
const dialogTitle = computed(() => (isEdit.value ? "编辑订单" : "新增订单"));

const totalAmount = computed(() => form.items.reduce((s, i) => s + i.subtotal, 0));
const payableAmount = computed(() => totalAmount.value + 15); // 默认运费15

watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (props.order) {
        Object.assign(form, {
          customerName: props.order.customerName,
          customerPhone: props.order.customerPhone,
          customerAddress: props.order.customerAddress,
          status: props.order.status,
          type: props.order.type,
          remark: props.order.remark,
          items: JSON.parse(JSON.stringify(props.order.items)),
        });
      } else {
        resetForm();
      }
    }
  }
);

function resetForm() {
  Object.assign(form, {
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    status: "pending",
    type: "normal",
    remark: "",
    items: [
      { id: "new-1", productName: "", spec: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ],
  });
  errorMsg.value = "";
}

function addItem() {
  form.items.push({
    id: "new-" + Date.now(),
    productName: "",
    spec: "",
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
  });
}

function removeItem(index: number) {
  if (form.items.length > 1) form.items.splice(index, 1);
}

function calcSubtotal(item: OrderItem) {
  item.subtotal = item.quantity * item.unitPrice;
}

function close() {
  emit("update:visible", false);
}

async function handleSubmit() {
  if (!form.customerName) {
    errorMsg.value = "请输入客户姓名";
    return;
  }
  if (!form.customerPhone) {
    errorMsg.value = "请输入联系电话";
    return;
  }
  if (form.items.length === 0 || !form.items[0].productName) {
    errorMsg.value = "请至少添加一个商品";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const payload = {
      ...form,
      totalAmount: totalAmount.value,
      shippingFee: 15,
      discount: 0,
      payableAmount: payableAmount.value,
    };
    if (isEdit.value && props.order) {
      await updateOrder(props.order.id, payload);
    } else {
      await createOrder(payload);
    }
    emit("success");
    close();
  } catch (e: any) {
    errorMsg.value = e.message || "保存失败";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-mask" @click.self="close">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ dialogTitle }}</h3>
          <span class="modal-close" @click="close">&times;</span>
        </div>
        <div class="modal-body">
          <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

          <div class="form-grid">
            <div class="form-group">
              <label>客户姓名 <span class="required">*</span></label>
              <input v-model="form.customerName" placeholder="请输入客户姓名" />
            </div>
            <div class="form-group">
              <label>联系电话 <span class="required">*</span></label>
              <input v-model="form.customerPhone" placeholder="请输入联系电话" />
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>收货地址</label>
              <input v-model="form.customerAddress" placeholder="请输入收货地址" />
            </div>
            <div class="form-group">
              <label>订单类型</label>
              <select v-model="form.type">
                <option value="normal">普通订单</option>
                <option value="urgent">加急订单</option>
                <option value="return">退货订单</option>
              </select>
            </div>
            <div class="form-group">
              <label>订单状态</label>
              <select v-model="form.status">
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="shipped">已发货</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>

          <!-- 商品明细 -->
          <div class="items-section">
            <div class="items-header">
              <span>商品明细</span>
              <button class="btn btn-sm btn-default" @click="addItem">+ 添加商品</button>
            </div>
            <div
              v-for="(item, idx) in form.items"
              :key="item.id"
              class="item-row"
            >
              <input v-model="item.productName" placeholder="商品名称" style="flex:2;" />
              <input v-model="item.spec" placeholder="规格" style="flex:1;" />
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                placeholder="数量"
                style="width:70px;"
                @input="calcSubtotal(item)"
              />
              <input
                v-model.number="item.unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="单价"
                style="width:90px;"
                @input="calcSubtotal(item)"
              />
              <span style="width:80px;text-align:right;font-weight:600;">¥{{ item.subtotal.toFixed(2) }}</span>
              <button class="btn-text" style="color:#f56c6c;" @click="removeItem(idx)" v-if="form.items.length > 1">删除</button>
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;">
            <label>备注</label>
            <textarea
              v-model="form.remark"
              placeholder="选填"
              rows="2"
              style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:13px;resize:vertical;"
            ></textarea>
          </div>

          <div class="amount-summary">
            <span>商品总额：<strong>¥{{ totalAmount.toFixed(2) }}</strong></span>
            <span>运费：<strong>¥15.00</strong></span>
            <span class="payable">实付：<strong>¥{{ payableAmount.toFixed(2) }}</strong></span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="close">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            {{ loading ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.modal-close {
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-error {
  background: #fef0f0;
  color: #f56c6c;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: var(--text-regular);
  margin-bottom: 6px;
  font-weight: 500;
}

.required {
  color: #f56c6c;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary);
}

.items-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-regular);
}

.item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.item-row input {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.amount-summary {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-regular);
}

.amount-summary .payable {
  color: var(--danger);
  font-size: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .item-row {
    flex-wrap: wrap;
  }
}
</style>
