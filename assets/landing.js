/*
  中文说明：DSH Buddy 产品介绍页的全部交互，只有一件事：复制包名。

  页面上有几处「复制」按钮，点了把包名放进剪贴板，并在页面底部弹一句「已复制」。
  这页不读取任何用户数据，不联网，不调用模型。
*/
(() => {
  'use strict';

  /* ---------- 小提示：复制成功或失败时，在页面底部冒出一句话 ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('visible');
    // 连续点几次时，只保留最后一次的计时，免得提示一闪就没
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  /* ---------- 复制包名 ---------- */
  // 每个复制按钮身上都带着 data-copy="要复制的文字"，这样 HTML 里改包名就行，不用改脚本
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      try {
        // 新浏览器的写法；用 file:// 直接打开或浏览器不允许时会抛错，走下面的老办法
        await navigator.clipboard.writeText(text);
        showToast('已复制。到 DSH 的插件页点「添加插件」，粘贴进去。');
      } catch (error) {
        // 老办法：临时放一个看不见的输入框，选中里面的字再执行复制
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(helper);
        showToast(ok ? '已复制。到 DSH 的插件页点「添加插件」，粘贴进去。' : '没复制成功，请手动选中包名复制。');
      }
    });
  });
})();
