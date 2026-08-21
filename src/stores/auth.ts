import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { post } from "@/api/request";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  role: string;
  token: string;
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem("token") || "");
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem("userInfo") || "null")
  );

  const isLoggedIn = computed(() => !!token.value);

  // 登录
  async function login(username: string, password: string): Promise<boolean> {
    if (USE_MOCK) {
      // Mock 登录：admin/123456
      await new Promise((r) => setTimeout(r, 500));
      if (username === "admin" && password === "123456") {
        const mockUser: UserInfo = {
          id: "1",
          username: "admin",
          name: "管理员",
          role: "admin",
          token: "mock-token-" + Date.now(),
        };
        token.value = mockUser.token;
        userInfo.value = mockUser;
        localStorage.setItem("token", mockUser.token);
        localStorage.setItem("userInfo", JSON.stringify(mockUser));
        return true;
      }
      throw new Error("用户名或密码错误");
    }
    const res = await post<{ token: string; user: UserInfo }>("/auth/login", { username, password });
    token.value = res.token;
    userInfo.value = res.user;
    localStorage.setItem("token", res.token);
    localStorage.setItem("userInfo", JSON.stringify(res.user));
    return true;
  }

  // 退出登录
  function logout() {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  return { token, userInfo, isLoggedIn, login, logout };
});
