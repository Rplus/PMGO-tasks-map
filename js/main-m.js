import centerMark from './center-mark.js';
import getLineInfo from './u/get-Line-info.js';
import ctrl from './ctrls.js';
import map from './map.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/PMGO-tasks-map/service-worker.js');
}

window.info = {
  nowlatlng: {}
};

let LineInfo;

getLineInfo().then(d => LineInfo = d)
document.body.appendChild(ctrl);
