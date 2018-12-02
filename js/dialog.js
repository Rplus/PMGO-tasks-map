import { urls } from './u/urls.js';
import * as u from './u/u.js';
import { reportTask } from './report-task.js';

let eventTasks = {
  '1. 撒尿牛丸月': [
    '強化10次：銀凰果',
    '傳送10隻：夢妖',
    '交換1隻：醜醜魚',
    '1曲G：晃晃斑',
    '團體戰獲勝1場：多邊獸',
  ],
  '2. 衝衝衝': [
    '7場絕佳：電擊獸',
    '連續3E：幼基拉斯',
    '孵5個蛋：吉利蛋',
    '孵3個蛋：鴨嘴火獸',
    '捉1隻龍：迷你龍',
    '3G：鬼斯',
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

      let html = Object.keys(tasks).sort().map(group => {
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

      html = `<option value="" label="--"></option>` + html;

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

    this.closeBtn.addEventListener('click', () => {
      this.close();
      this.dialog.isClosedByHand = true;
    });
    this.reportForm.addEventListener('submit', reportTask);
  }
}

let dialog = new reportDialog();
dialog.init();

export { dialog as default }
