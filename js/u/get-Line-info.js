import { urls } from './urls.js';
import * as u from './u.js';

function getLineID() {
  let LineID;
  let idFromStorage = localStorage.getItem('LineID');
  let idFromURL = new URLSearchParams(location.search).get('LineID');
  if (idFromURL) {
    LineID = idFromURL;
    localStorage.setItem('LineID', idFromURL);
  } else if (idFromStorage) {
    LineID = idFromStorage;
  }

  return LineID;
};

function getLineInfo() {
  let LineID = getLineID();
  if (!LineID) { return; }

  return (
    u.fetchJSON(`${urls.reportTask}?method=get_profile&LineID=${LineID}`)
    .then(d => {
      if (d.success) {
        window.info.LineInfo = d;
        document.getElementById('task-reporter').innerText = d.displayName;
      } else {
        localStorage.removeItem('LineID');
        prompt('請透過加入Line機器人[oh?]，啟動回報權限。', 'https://line.me/R/ti/p/%40wbf4859b');
      }
      return d;
    })
  );
};

export default getLineInfo;
