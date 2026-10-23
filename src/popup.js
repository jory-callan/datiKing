/** @license MIT — QuizKing · 答题王 toolbar popup. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-k]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const k = btn.getAttribute("data-k");
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      // show-fab / toggle-bubble are direct messages (no capture payload), the rest go through aqh/capture.
      const msg = (k === "show-fab")
        ? { type: "aqh/show-fab" }
        : (k === "toggle-bubble")
          ? { type: "aqh/toggle-bubble" }
          : { type: "aqh/capture", payload: { kind: k } };
      chrome.tabs.sendMessage(tab.id, msg, (res) => {
        if (chrome.runtime.lastError) { $("status").textContent = "当前页面不可用"; return; }
        if (k === "show-fab" && res && typeof res.shown === "boolean") {
          $("status").textContent = res.shown ? "已召唤 王字气泡" : "已收起 王字气泡";
        }
        if (k === "toggle-bubble" && res && res.ok) {
          $("status").textContent = !res.exists
            ? "当前页面还没有结果界面"
            : (res.shown ? "已展开 结果界面" : "已收起 结果界面");
        }
      });
      if (k !== "show-fab" && k !== "toggle-bubble") $("status").textContent = "已发送：" + k;
    });
  });
  $("opts").addEventListener("click", () => chrome.runtime.openOptionsPage());

  chrome.runtime.sendMessage({ type: "aqh/test" }, (res) => {
    if (!res || !res.ok) {
      $("status").textContent = "插件暂未就绪";
      return;
    }
    const n = res.providerCount || 0;
    $("keyState").textContent = res.hasKey
      ? ("API Key ✓" + (n > 1 ? (" · " + n + " 个服务商") : ""))
      : "未配置 API Key";
  });
});

function $(id) { return document.getElementById(id); }
