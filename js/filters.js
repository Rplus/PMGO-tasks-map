import { urls } from './u/urls.js';
import { getTasks } from './get-data.js';

let filterBoxClass = 'filters';

function createIndicator() {
  return (`
    <input type="checkbox" name="Filter" id="Filter">
    <label for="Filter">Filter</label>
    <div class="${filterBoxClass}"></div>
  `);
}

getTasks.then(tasks => {
  console.log({tasks});

  let dom = tasks.reduce((all, task) => {
    all.input.push(`
      <input
        type="checkbox"
        class="ckbox-filter"
        id="ckbox_${task}" checked />`);
    all.label.push(`
      <label for="ckbox_${task}">
        <img src="${urls.imgHost}/${task}_.png" title="${task}" />
      </label>`);
    all.style.push(`
      #ckbox_${task}:not(:checked) ~ #map img[src$="/${task}_.png"] { display: none; }
      #ckbox_${task}:not(:checked) ~ .ctrl img[src$="/${task}_.png"] { filter: contrast(0%); }
    `);
    return all;
  }, { input: [], label: [], style: [] });

  let filter = document.querySelector(`.${filterBoxClass}`);
  let style = document.createElement('style');
  style.innerHTML = dom.style.join('');
  filter.innerHTML = dom.label.join('');
  filter.insertAdjacentElement('afterbegin', style);
  document.querySelector('#map').insertAdjacentHTML('beforebegin', dom.input.join(''));
});

let filterIndicator = createIndicator();

export default filterIndicator;