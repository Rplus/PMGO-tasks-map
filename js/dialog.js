import { urls } from './u/urls.js';
import * as u from './u/u.js';
import { reportTask } from './report-task.js';

let eventTasks = {
  '2. 水君月': [
    '進化10隻(水)：迷你龍',
    '交換1隻：醜醜魚',
    '抓5隻(水系)：大鉗蟹',
    '2曲N：晃晃斑',
    '使用5凰果：銀凰果',
    '孵2個蛋：吼吼鯨',
  ],
  '1. 萬聖節': [
    '捉10隻幽靈系：勾魂眼',
    '捉5隻土狼犬/戴魯比：狃拉',
    '傳送10隻：夢妖',
    '進化3隻夜巡靈/怨影娃娃：1糖',
  ],
  '3. 衝衝衝': [
    '7場絕佳：電擊獸',
    '連續3E：幼基拉斯',
    '孵5個蛋：吉利蛋',
    '孵3個蛋：鴨嘴火獸',
    '捉1隻龍：迷你龍',
  ],
};

let events = Object.keys(eventTasks);

class reportDialog {
  constructor() {
    this.open = () => this.dialog.showModal();
    this.close = () => this.dialog.close();

    this.updateReportTasks = (tasks) => {
      if (!tasks) { return; }

      tasks = tasks.reduce((all, task) => {
        let eventGroup = null;
        events.some(event => {
          let matched = eventTasks[event].includes(task);
          if (matched) {
            eventGroup = event;
          }
          return matched;
        });

        eventGroup = eventGroup || '=====';

        all[eventGroup] = all[eventGroup] || [];
        all[eventGroup].push(task);

        return all;
        }, {});

      let html = Object.keys(tasks).sort((a, b) => a[0] > b[0]).map(group => {
        return (`
          <optgroup label="${group}">
            ${
              u.generateOptions(
                tasks[group].sort().map(task => ({
                  value: task,
                  label: task,
                }))
              )
            }
          </optgroup>
        `);
      }).join('');

      this.reportTask.innerHTML = html;
    };
  }

  init() {
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'dialog';
    this.dialog.innerHTML = `
      <form id="report-form" class="report-form" action="${urls.reportTask}">
        <dl class="report-content">
          <dt>回報人:</dt>
          <dd id="task-reporter"></dd>

          <dt>補給站：</dt>
          <dd id="task-site-name">
            <select id="report-site"></select>
          </dd>

          <dt>任務：</dt>
          <dd id="task-name">
            <select id="report-task"></select>
          </dd>
        </dl>
        <div class="submit-box">
          <input id="submit" type="submit" />
        </div>
      </form>
      <button id="close-dialog">❌</button>`;
    document.body.appendChild(this.dialog);

    this.reportSite = document.getElementById('report-site');
    this.reportTask = document.getElementById('report-task');
    this.submitBtn = document.getElementById('submit');
    this.reportForm = document.getElementById('report-form');
    this.closeBtn = document.getElementById('close-dialog');

    console.info('dialog inited');

    // get_tasks_full
    u.fetchJSON(`${urls.macros}?method=get_tasks_full`)
      .then(this.updateReportTasks);

    this.closeBtn.addEventListener('click', this.close);
    this.reportForm.addEventListener('submit', reportTask);
  }
}

let dialog = new reportDialog();
dialog.init();

export { dialog as default }
