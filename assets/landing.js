// 中文说明：为项目介绍页提供角色切换、工作过程、唤醒场景、示例审批和弹层。所有内容均为本地演示，不读取用户数据，不调用模型或真实工具。
(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const buddies = {
    research: {
      name: '阿知', role: '调研队友', status: '在盯着：你关心的信息源', goal: '帮你持续看懂 AI 产品的新变化',
      owner: '帮我盯着这几个产品的更新。<br>真正值得看的，再告诉我。', time: '发现新变化后',
      reply: '有一项更新值得你看：它改变了产品的协作方式。我把变化和对我们的启发整理好了。',
      artifact: '产品更新观察.md', meta: '变化摘要 · 来源线索 · 值得借鉴的点', reason: '关注的内容更新了，且与你的目标有关。',
      report: [
        ['这次交付', '一份产品更新观察，按“变化—影响—启发”整理，方便你决定是否继续深入。'],
        ['依据在哪里', '真实工作时会附原始公告、更新时间与前次记录。本演示没有执行实际检索，未提供真实研究结论。'],
        ['下一步', '继续关注后续公开更新；发现影响目标的新变化时，再比较并整理。'],
        ['还没有做的事', '没有登录网站、联系任何人，或替你作出产品决策。'],
      ],
    },
    execute: {
      name: '阿行', role: '执行队友', status: '在跟进：有明确标准的交付', goal: '把你交代的小任务变成可检查的产物',
      owner: '这些测试资料帮我分类整理一下。<br>做完告诉我放在哪，别覆盖原文件。', time: '完成整理后',
      reply: '整理清单已经做好，产物放在我的工作区。原文件没有覆盖，我也列出了需要你确认的项。',
      artifact: '资料整理清单.md', meta: '产物位置 · 核对结果 · 待确认事项', reason: '你交代的任务正在推进，需要完成并核对交付。',
      report: [
        ['这次交付', '一份资料分类清单，记录每项资料的类别与建议命名；这里展示交付格式。'],
        ['产物在哪里', '真实交付会写出队友工作区内的准确位置，并允许你打开工作会话检查工具记录。'],
        ['如何核对', '按来源清单逐项对照，不覆盖原文件；无法确定的资料单独列出，交给你确认。'],
        ['下一步', '如果你要把文件移到队友工作区外，会进入对应审批流程。本演示未操作任何文件。'],
      ],
    },
    watch: {
      name: '阿守', role: '盯守队友', status: '在盯着：测试日志有没有按时更新', goal: '发现“该发生，却没发生”的事',
      owner: '帮我盯着这份测试日志。<br>工作日早上该有新内容，没有就告诉我。', time: '发现期望落空后',
      reply: '今天该出现的测试记录还没有更新。我整理了最后更新时间和检查依据，等你决定要不要进一步处理。',
      artifact: '测试日志检查.md', meta: '期望落空 · 最近记录 · 检查依据', reason: '到了约定的检查期限，期待的新内容没有出现。',
      report: [
        ['发现了什么', '示例情境：工作日到期后，测试日志中仍没有期待的新内容。'],
        ['依据在哪里', '真实工作会附检查日期、期望、最后更新时间和日志位置，避免只报一句“出错了”。'],
        ['下一步', '你可以让它继续查明原因；需操作真实系统时，再根据动作类别处理审批。'],
        ['还没有做的事', '没有重启服务、运行修复命令，或把恢复成功当成已经验证的事实。'],
      ],
    },
    lead: {
      name: '阿策', role: '小队总管', status: '在留意：全队目标与卡住的事项', goal: '让小队的分工和下一步清楚可见',
      owner: '帮我看看大家现在到哪一步了。<br>卡住的事情，整理给我。', time: '核对小队状态后',
      reply: '我把全队进展整理成一页：已经完成的、正在做的，以及需要你决定的事。先看最后一项就好。',
      artifact: '小队进展汇总.md', meta: '团队进度 · 阻塞事项 · 需要你决定的事', reason: '你询问了全队进展，需要核对并汇总当前状态。',
      report: [
        ['这次交付', '一份小队进展汇总，把“已完成、进行中、受阻、等你”分开说明。'],
        ['依据在哪里', '真实工作读取全队的目标、议程和交账记录；不会把队友的计划自动认作已完成。'],
        ['你需要决定', '对涉及范围变更或外部操作的事项，列出具体问题与审批请求。'],
        ['下一步', '按分工协调跟进，保留交接与工作记录。本页没有连接真实小队。'],
      ],
    },
  };
  let currentBuddy = 'research';
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
    byId('owner-message').innerHTML = buddy.owner;
    byId('message-author').innerHTML = `${buddy.name} <small>${buddy.time}</small>`;
    byId('buddy-message').textContent = buddy.reply;
    byId('artifact-name').textContent = buddy.artifact;
    byId('artifact-meta').textContent = buddy.meta;
    byId('wake-reason').textContent = buddy.reason;
    byId('open-artifact').setAttribute('aria-label', `查看${buddy.name}的交付示例：${buddy.artifact}`);
  }

  // 三个阶段共用一个容器，审批结果保留，切换故事时不会偷偷重新获得批准。
  function renderStory(step) {
    if (![0, 1, 2].includes(step)) return;
    currentStep = step;
    document.querySelectorAll('[data-step]').forEach((button) => {
      const active = Number(button.dataset.step) === step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    byId('story-panel').setAttribute('aria-labelledby', `step-${step}`);
    const labels = ['一句话，变成长期记着的事', '一次有理由的主动跟进', '产物先准备好，重要动作请你决定'];
    byId('story-label').textContent = labels[step];
    if (step === 0) {
      byId('story-screen').innerHTML = `<div class="story-message">“阿知，帮我持续留意这个项目。<br>关注产品思路的变化，有启发的整理给我。”</div><div class="story-task">${icon('check')}<div><b>记下目标，也记下你的边界</b><p>关注：指定的公开信息源<br>交付：变化摘要、依据与启发<br>边界：先整理，不对外发布</p></div></div><p class="story-summary">新队友会先自我介绍，提出起步要关注的内容。试岗期的关注提议需要你接受。</p>`;
    } else if (step === 1) {
      byId('story-screen').innerHTML = `<h3>不用等你再问一遍。</h3><div class="event-row">${icon('eye')}<div><b>关注的信息有了重要变化</b><p>先记录，再看它与你的目标有什么关系</p></div><span>会考虑行动</span></div><div class="event-row">${icon('clock')}<div><b>答应跟进的事情到了期限</b><p>把承诺放进议程，记着下一次检查</p></div><span>会主动跟进</span></div><div class="event-row">${icon('chat')}<div><b>目标很久没有推进</b><p>回头看看卡在哪，是否需要换个办法</p></div><span>会考虑复盘</span></div><p class="story-summary">满足规则后再排队。每次为什么醒、为什么没醒，都会留下记录；执行仍受预算和权限限制。</p>`;
    } else {
      const result = approvalDecision === 'approved' ? '你批准了这一次示例操作。真实产品会按批准内容继续处理，并记录结果。' : '你暂不批准这次示例操作。队友保留产物，不执行该动作。';
      byId('story-screen').innerHTML = `<div class="approval-card"><div class="approval-eyebrow">${icon('lock')}需要你拍板 · 演示</div><h3>把观察笔记复制到你的资料目录？</h3><p>队友已在自己的工作区准备好笔记。写到你的目录前，先请你确认这一个具体动作。</p><div class="approval-scope">范围：只复制这一份文件，不改动其他资料。</div>${approvalDecision ? `<div class="approval-outcome">${result}</div><div class="approval-actions"><button class="button button-outline" data-approval="restore">恢复演示</button></div>` : `<div class="approval-actions"><button class="button button-accent" data-approval="approved">批准这一次（演示）</button><button class="button button-outline" data-approval="declined">暂不批准</button></div>`}</div><p class="story-summary">队友还会交代：产物在哪、验证了什么、还有哪些没做。本页审批不执行任何真实文件操作。</p>`;
    }
  }

  const signals = {
    calm: { status: '继续观察', title: '这次，不用叫醒。', description: '中心继续留意，你也继续忙自己的事。', icon: 'eye', receipt: '本次判断：没有需要处理的新事项，不调用模型。', footnote: '目标停滞、承诺到期或轻复查到期，仍可能触发思考。' },
    change: { status: '有理由，排队处理', title: '这件事，值得看一看。', description: '变化与你的目标有关，队友准备比较、整理并交付。', icon: 'file', receipt: '本次判断：产生相关候选，按节奏、预算和额度安排思考。', footnote: '日常进展记在线程和日报里，避免每个小变化都来打扰。' },
    owner: { status: '等你决定', title: '先把问题说清楚。', description: '剩下的步骤需要你拍板，队友提出具体请求后停下来等。', icon: 'lock', receipt: '本次判断：提交请求，不为同一件待回复的事反复醒来。', footnote: '普通提醒受免打扰与打扰预算约束；紧急系统告警例外。' },
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
    byId('artifact-content').innerHTML = `<div class="report-status">${icon('check')}交付结构示例 · ${buddy.name}</div>${buddy.report.map(([title, content]) => `<section class="report-section"><h3>${title}</h3><p>${content}</p></section>`).join('')}`;
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
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
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
      showToast(approvalDecision === 'approved' ? '已批准本次演示；没有执行真实操作' : approvalDecision === 'declined' ? '已暂不批准；示例产物仍保留' : '审批演示已恢复');
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
