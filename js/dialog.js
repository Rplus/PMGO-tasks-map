import { urls } from './u/urls.js';
import * as u from './u/u.js';
import { reportTask } from './report-task.js';

let eventTasks = {
  '1. 撒尿牛丸月': [
    '銀凰果',
    '夢妖',
    '醜醜魚',
    '晃晃斑',
    '多邊獸',
  ],
  '2. 衝衝衝': [
    '電擊獸',
    '幼基拉斯',
    '吉利蛋',
    '迷唇姐',
    '鴨嘴火獸',
    '迷你龍',
    '鬼斯',
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
          let matched = eventTasks[event].includes(task && task.split('：')[1]);
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
