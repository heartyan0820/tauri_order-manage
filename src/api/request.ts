import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/order";

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可在此添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<any>;
    if (res.code !== 0 && res.code !== 200) {
      console.error("API Error:", res.message);
      return Promise.reject(new Error(res.message || "请求失败"));
    }
    return res.data;
  },
  (error) => {
    console.error("Network Error:", error.message);
    return Promise.reject(error);
  }
);

// 封装请求方法
export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as Promise<T>;
}

export function get<T>(url: string, params?: any): Promise<T> {
  return request<T>({ url, method: "GET", params });
}

export function post<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: "POST", data });
}

export function put<T>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: "PUT", data });
}

export function del<T>(url: string): Promise<T> {
  return request<T>({ url, method: "DELETE" });
}

export default service;
