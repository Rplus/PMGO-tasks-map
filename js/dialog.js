import { urls } from './u/urls.js';
import * as u from './u/u.js';
import { reportTask } from './report-task.js';

let eventTasks = [
  '進化10隻(水)：迷你龍',
  '捉5凱西、催眠貘：迷唇姐',
  '進化3呆呆獸、蛋蛋：麒麟奇',
  '抓10隻(超)：1000星塵',
];

eventTasks.title = '超能力週';

class reportDialog {
  constructor() {
    this.open = () => this.dialog.showModal();
    this.close = () => this.dialog.close();

    this.updateReportTasks = (tasks) => {
      if (!tasks) { return; }

      if (eventTasks) {
        tasks = tasks.reduce((all, task) => {
          if (eventTasks.includes(task)) {
            all.event.push(task);
          } else {
            all.normal.push(task);
          }
          return all;
        }, { event: [], normal: [] });
      }

      let html = '';

      if (tasks.event) {
        html = `
          <optgroup label="${eventTasks.title}">
          ${
            u.generateOptions(
              tasks.event.sort().map(task => ({
                value: task,
                label: task,
              }))
            )
          }
          </optgroup>`;
      }

      html += (
        u.generateOptions(
          tasks.normal.sort().map(task => ({
            value: task,
            label: task,
          }))
        )
      );

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