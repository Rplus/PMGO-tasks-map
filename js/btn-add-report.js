import { addReport } from './report-task.js';

function createAddReportBtn() {
  let dom = document.createElement('button');
  dom.id = 'add-report';
  dom.innerText = '+';
  dom.addEventListener('click', addReport);
  return dom;
}

let addReportBtn = createAddReportBtn();

export default addReportBtn;
