import { getData } from './get-data.js';

function createReFetchBtn() {
  let dom = document.createElement('button');
  dom.id = 're-fetch';
  dom.innerText = '↻';
  dom.addEventListener('click', getData);
  return dom;
}

let reFetchBtn = createReFetchBtn();

export default reFetchBtn;
