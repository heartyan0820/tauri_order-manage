/**
 * 桌面端通知工具
 * - Tauri 桌面端：使用 @tauri-apps/plugin-notification
 * - Web 端：使用浏览器 Notification API
 * - 移动端：使用系统通知（需配合推送插件）
 */

let tauriNotify: any = null;

// 尝试加载 Tauri 通知插件
async function getTauriNotify() {
  if (tauriNotify) return tauriNotify;
  try {
    const mod = await import("@tauri-apps/plugin-notification");
    tauriNotify = mod;
    return mod;
  } catch {
    return null;
  }
}

// 判断是否在 Tauri 环境
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * 请求通知权限
 */
export async function requestNotifyPermission(): Promise<boolean> {
  if (isTauri()) {
    const mod = await getTauriNotify();
    if (mod) {
      const perm = await mod.isPermissionGranted();
      if (!perm) {
        const result = await mod.requestPermission();
        return result === "granted";
      }
      return true;
    }
  }
  // Web 端
  if ("Notification" in window) {
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
  }
  return false;
}

/**
 * 发送通知
 * @param title 标题
 * @param body 内容
 */
export async function sendNotification(title: string, body: string) {
  if (isTauri()) {
    const mod = await getTauriNotify();
    if (mod) {
      mod.sendNotification({ title, body });
      return;
    }
  }
  // Web 端
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}
