import centerMark from './center-mark.js';
import getLineInfo from './u/get-Line-info.js';
import ctrl from './ctrls.js';
import map from './map.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/PMGO-tasks-map/service-worker.js');

  if (location.search === '?clear=cache') {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
}

window.info = {
  nowlatlng: {}
};

let LineInfo;

getLineInfo().then(d => LineInfo = d)
document.body.appendChild(ctrl);

if (
  ('Notification' in window) &&
  (Notification.permission !== 'granted') &&
  confirm('需要「通知」的權限')
  ) {
  Notification.requestPermission();
}
