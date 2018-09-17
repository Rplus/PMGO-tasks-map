import locateMeBtn from './btn-locate-me.js';
import reFetchBtn from './btn-re-fetch.js';
import addReportBtn from './btn-add-report.js';
import filterIndicator from './filters.js';

let ctrl = document.createElement('div');
ctrl.className = 'ctrl';

ctrl.appendChild(addReportBtn);
ctrl.appendChild(locateMeBtn);
ctrl.appendChild(reFetchBtn);
ctrl.insertAdjacentHTML('beforeend', filterIndicator);

export default ctrl;
