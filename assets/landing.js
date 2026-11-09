// 中文说明：为项目介绍页提供角色切换、工序步骤、场景信号与示例弹层。所有内容均为本地演示，不读取用户数据，不调用模型或真实工具。
(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  // 三位队友各代表项目里的一道工序：做事、评审、测试。验收不在这里，它是主人自己的动作。
  const buddies = {
    build: {
      name: '阿行', role: '做事的', status: '在推进：登录页改版', goal: '把登录页按验收项改完',
      owner: '登录页按验收项改完，改完把结果和依据发我。', time: '做完以后',
      reply: '改完了。三处问题都动了，结果和依据写在汇报里。',
      artifact: '结果汇报.md', meta: '做了什么 · 依据 · 没做完的', reason: '任务派给了它，它接下了。',
      report: [
        ['这次交了什么', '一份结果汇报，写清改了什么、依据在哪、还有什么没做完。'],
        ['依据在哪里', '真实工作时会附上改动的文件和验收项逐条对照；本演示没有执行真实修改。'],
        ['下一步', '交给评审的找问题，再交给测试的走一遍。'],
        ['还没有做的事', '没有替你判断过没过，也没有对外发布。'],
      ],
    },
    review: {
      name: '阿知', role: '评审的', status: '在评审：登录页改版', goal: '对照验收项评审登录页',
      owner: '按验收项评审，能复现的问题写清步骤。', time: '评审完以后',
      reply: '发现两处问题，都能复现。我把步骤和依据写进清单了。',
      artifact: '问题清单.md', meta: '问题 · 复现步骤 · 依据', reason: '做事的队友交回来了，轮到评审。',
      report: [
        ['这次交了什么', '一份问题清单，每条写清是什么、怎么复现、对着哪条验收项。'],
        ['依据在哪里', '真实工作会附验收项原文和出问题的位置；本演示没有读真实代码。'],
        ['下一步', '做事的改完再交回来；测试的按清单补用例。'],
        ['还没有做的事', '没有替你判断能不能交，也没有直接改代码。'],
      ],
    },
    test: {
      name: '阿守', role: '测试的', status: '在测试：登录流程', goal: '把登录流程按用例走一遍',
      owner: '把登录流程走一遍，重点看失败提示。', time: '测完以后',
      reply: '走了五条路径，两条失败提示不对。记录和步骤在文件里。',
      artifact: '测试记录.md', meta: '用例 · 结果 · 失败步骤', reason: '评审过了，轮到测试。',
      report: [
        ['这次交了什么', '一份测试记录，列出走了哪些用例、哪条没过、怎么复现。'],
        ['依据在哪里', '真实工作会附用例、环境与失败截图；本演示没有实际运行界面。'],
        ['下一步', '没过的回到做事的改，改完再测一遍。'],
        ['还没有做的事', '没有替你点通过，也没有扩大测试范围。'],
      ],
    },
  };
  let currentBuddy = 'build';
  let currentStep = 1;
  let approvalDecision = null;
  let toastTimer;
  const dialogOpeners = new WeakMap();

  // 把固定的演示数据放入界面；HTML 片段只来自本文件，没有用户输入或远端内容。
  function renderBuddy(key) {
    const buddy = buddies[key];
    if (!buddy) return;
    currentBuddy = key;
    document.querySelectorAll('[data-buddy]').forEach((button) => {
      const active = button.dataset.buddy === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    byId('buddy-panel').setAttribute('aria-labelledby', `tab-${key}`);
    byId('buddy-name').innerHTML = `${buddy.name} <span>${buddy.role}</span>`;
    byId('buddy-status').innerHTML = `<span class="status-dot"></span>${buddy.status}`;
    byId('buddy-goal').textContent = buddy.goal;
    byId('owner-message').textContent = buddy.owner;
    byId('message-author').innerHTML = `${buddy.name} <small>${buddy.time}</small>`;
    byId('buddy-message').textContent = buddy.reply;
    byId('artifact-name').textContent = buddy.artifact;
    byId('artifact-meta').textContent = buddy.meta;
    byId('wake-reason').textContent = buddy.reason;
    byId('open-artifact').setAttribute('aria-label', `查看${buddy.name}交的示例：${buddy.artifact}`);
  }

  // 七道工序共用一个容器；审批结果保留，切换步骤时不会偷偷重新获得批准。
  function renderStory(step) {
    if (![0, 1, 2, 3, 4, 5, 6].includes(step)) return;
    currentStep = step;
    document.querySelectorAll('[data-step]').forEach((button) => {
      const active = Number(button.dataset.step) === step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    byId('story-panel').setAttribute('aria-labelledby', `step-${step}`);
    const labels = ['派给做事的队友', '它按验收项往前推', '把结果和依据写回来', '评审找问题，测试走用例', '预验收只给结论', '没过就退回去改，改完再交', '你对照验收项，点通过或驳回'];
    byId('story-label').textContent = labels[step];
    if (step === 0) {
      byId('story-screen').innerHTML = `<div class="story-message">“把登录页按验收项改完。<br>改完把结果和依据发我。”</div><div class="story-task">${icon('check')}<div><b>写清要做什么、怎么算做完</b><p>验收项：三条，逐条对照<br>交付：结果、依据、没做完的<br>边界：先改自己的文件，不动线上</p></div></div><p class="story-summary">项目里先有验收项，再派活。谁做、做到什么程度，都对着同一份标准。</p>`;
    } else if (step === 1) {
      byId('story-screen').innerHTML = `<h3>它按验收项往前推。</h3><div class="event-row">${icon('eye')}<div><b>先看验收项和项目资料</b><p>确认要改哪几处，依据是什么</p></div><span>做事的</span></div><div class="event-row">${icon('file')}<div><b>在自己的文件夹里改</b><p>写到别处要先问你</p></div><span>做事的</span></div><div class="event-row">${icon('clock')}<div><b>卡住了就停下</b><p>把问题和已做的部分写回来</p></div><span>做事的</span></div><p class="story-summary">它不能自己说“做完了”。没交回来、没通过检查，任务就还在进行中。</p>`;
    } else if (step === 2) {
      byId('story-screen').innerHTML = `<h3>交回来的是结果，不是一句“好了”。</h3><div class="event-row">${icon('file')}<div><b>做了什么</b><p>改了哪几处，对应哪条验收项</p></div><span>汇报</span></div><div class="event-row">${icon('eye')}<div><b>依据在哪</b><p>文件位置、检查结果、来源线索</p></div><span>汇报</span></div><div class="event-row">${icon('clock')}<div><b>还有什么没做完</b><p>卡住的原因，需要你决定的事</p></div><span>汇报</span></div><p class="story-summary">三样都写清，评审和测试才有得看。少一样，就退回让它补。</p>`;
    } else if (step === 3) {
      byId('story-screen').innerHTML = `<h3>评审找问题，测试走用例。</h3><div class="event-row">${icon('chat')}<div><b>评审的对照验收项</b><p>能复现的写清步骤，不能复现的标出来</p></div><span>评审的</span></div><div class="event-row">${icon('check')}<div><b>测试的按用例走</b><p>哪条过了，哪条没过，失败在哪一步</p></div><span>测试的</span></div><p class="story-summary">评审和测试看的是同一份验收项。标准不一致，问题就会互相打架。</p>`;
    } else if (step === 4) {
      byId('story-screen').innerHTML = `<h3>先给结论，不替你拍板。</h3><div class="story-task">${icon('lock')}<div><b>能交 / 不能交</b><p>对着验收项逐条标：过了、没过、没验<br>没过的那条，附问题和复现步骤</p></div></div><p class="story-summary">预验收只给结论。它说“能交”，也不等于你点了通过。</p>`;
    } else if (step === 5) {
      byId('story-screen').innerHTML = `<h3>没过就退回去改，改完再交。</h3><div class="story-task">${icon('clock')}<div><b>退回做事的队友</b><p>问题清单和失败步骤一起带回去<br>改完从评审再走一遍</p></div></div><p class="story-summary">返工不是重来。上一轮的结果、依据和问题记录都留在项目里。</p>`;
    } else {
      const result = approvalDecision === 'approved' ? '你点了通过。这一轮结束，记录留在项目里。' : '你点了驳回。任务退回做事的队友，从评审再走一遍。';
      byId('story-screen').innerHTML = `<div class="approval-card"><div class="approval-eyebrow">${icon('lock')}等你验收 · 演示</div><h3>登录页改版，能交吗？</h3><p>做事的交了结果，评审和测试都过了，预验收给了「能交」。最后一步在你这里。</p><div class="approval-scope">范围：只对这一轮的交付拍板。</div>${approvalDecision ? `<div class="approval-outcome">${result}</div><div class="approval-actions"><button class="button button-outline" data-approval="restore">恢复演示</button></div>` : `<div class="approval-actions"><button class="button button-accent" data-approval="approved">通过（演示）</button><button class="button button-outline" data-approval="declined">驳回（演示）</button></div>`}</div><p class="story-summary">驳回不是说白做。记录和问题都留着，改完从评审再走一遍。本页审批不执行任何真实操作。</p>`;
    }
  }

  const signals = {
    calm: { status: '继续观察', title: '这次没人动。', description: '插件继续盯着，你继续做自己的事。', icon: 'eye', receipt: '本次判断：没有要处理的事，不调用模型。', footnote: '任务到期、承诺到期，仍可能叫醒队友。' },
    change: { status: '轮到做事的', title: '轮到做事的队友。', description: '任务派下来，做事的队友开始按验收项推进。', icon: 'file', receipt: '本次判断：有任务待推进，按预算和额度安排。', footnote: '日常进展进日报，避免每件小事都来找你。' },
    owner: { status: '轮到你', title: '轮到你了。', description: '评审、测试、预验收都过了，最后一票在你手里。', icon: 'lock', receipt: '本次判断：交付已到验收环节，等你点通过或驳回。', footnote: '普通提醒受免打扰与打扰预算约束；紧急告警例外。' },
  };
  function renderSignal(key) {
    const signal = signals[key];
    if (!signal) return;
    document.querySelectorAll('[data-signal]').forEach((button) => {
      const active = button.dataset.signal === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    ['status', 'title', 'description', 'receipt', 'footnote'].forEach((field) => { byId(`signal-${field}`).textContent = signal[field]; });
    byId('signal-icon').innerHTML = `<use href="#i-${signal.icon}"/>`;
  }

  // 顶部短暂提示只说明当前演示操作，避免把成功消息长期挂在页面上。
  function showToast(message) {
    clearTimeout(toastTimer);
    byId('toast').textContent = message;
    byId('toast').classList.add('visible');
    toastTimer = setTimeout(() => byId('toast').classList.remove('visible'), 2200);
  }
  function showDialog(id, opener) {
    const dialog = byId(id);
    if (dialog && !dialog.open) {
      dialogOpeners.set(dialog, opener);
      dialog.showModal();
    }
  }
  function renderReport() {
    const buddy = buddies[currentBuddy];
    byId('artifact-dialog-title').textContent = buddy.artifact.replace('.md', '');
    byId('artifact-content').innerHTML = `<div class="report-status">${icon('check')}示例 · ${buddy.name} ${buddy.role}</div>${buddy.report.map(([title, content]) => `<section class="report-section"><h3>${title}</h3><p>${content}</p></section>`).join('')}`;
    showDialog('artifact-dialog', byId('open-artifact'));
  }

  // 原生按钮支持点击；标签组额外支持方向键、Home/End，便于不用鼠标切换。
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    list.addEventListener('keydown', (event) => {
      const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      const tabs = [...list.querySelectorAll('[role="tab"]')];
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.buddy) renderBuddy(button.dataset.buddy);
    if (button.dataset.step !== undefined) renderStory(Number(button.dataset.step));
    if (button.dataset.signal) renderSignal(button.dataset.signal);
    if (button.dataset.approval) {
      approvalDecision = button.dataset.approval === 'restore' ? null : button.dataset.approval;
      renderStory(currentStep);
      showToast(approvalDecision === 'approved' ? '点了通过（演示）。没有执行真实操作。' : approvalDecision === 'declined' ? '点了驳回（演示）。记录还留着。' : '验收演示已恢复');
      byId('story-screen').querySelector('[data-approval]')?.focus({ preventScroll: true });
    }
    if (button.id === 'open-artifact') renderReport();
    if (button.id === 'open-start') showDialog('start-dialog', button);
    if (button.dataset.closeDialog) byId(button.dataset.closeDialog).close();
  });
  // 仅点击弹层外的背景才关闭；正文内部点击不会误触关闭。
  document.querySelectorAll('dialog').forEach((dialog) => {
    // macOS 浏览器不一定在鼠标点击按钮时给予焦点，显式返回触发按钮方便继续键盘操作。
    dialog.addEventListener('close', () => dialogOpeners.get(dialog)?.focus({ preventScroll: true }));
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  renderBuddy(currentBuddy);
  renderStory(currentStep);
  renderSignal('calm');
})();
