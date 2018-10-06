import reportDialog from './dialog.js';
import map from './map.js';
import * as u from './u/u.js';
import { urls } from './u/urls.js';
import { setMark } from './set-mark.js';
import { renderMarkersInView } from './map.js';

const splitChar = '@x@';

function getNearbySites() {
  let conter = map.getCenter();
  let dd = new Date().getDate() > 15 ? 2 : 1;
  let url = `https://pokestop-taiwan-${dd}.herokuapp.com/get_bbox_sites/${conter.lat}/${conter.lng}`;

  fetch(url)
    .then(d => d.json())
    .then(updateReportSites);
}

function updateReportSites(sites) {
  if (!sites) {
    reportDialog.reportSite.innerHTML = '';
    return;
  }

  reportDialog.reportSite.innerHTML = u.generateOptions(
    sites.map(site => ({
      value: `${site.poke_title}${splitChar}${site.poke_lat}${splitChar}${site.poke_lng}${splitChar}${site.poke_image}`,
      label: site.poke_title,
    }))
  ).join('');
};


export function reportTask(e) {
  e.preventDefault();
  console.log('report task');

  if (this.title) { return; }
  this.title = 'Processing…';

  let [
    pokestop,
    lat,
    lng,
    image,
  ] = reportDialog.reportSite.value.split(splitChar);
  let task = reportDialog.reportTask.value;

  let postInfo = {
    LineID: window.info.LineInfo.userId,
    task,
    pokestop,
    lat,
    lng,
    image,
  };

  let postParams = new URLSearchParams(postInfo);

  fetch(urls.reportTask, {
    method: 'POST',
    body: postParams.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(u.toJSON)
  .then(d => {
    this.title = '';
    reportDialog.close();
    if (d.success){
      setMark({
        ...postInfo,
        site_name: pokestop,
        address: '',
        'T&F': { T: 0, F: 0 },
      });
      renderMarkersInView();
      // onLoad();
    } else {
      alert(d.msg || 'GG');
    }
  })
  .catch(() => (this.title = ''));
}


export function addReport(params) {
  if (!window.info.LineInfo) { return; }

  if (reportDialog.dialog.open) {
    reportDialog.close();
  }

  // window.dd = reportDialog;
  reportDialog.open();

  updateReportSites(null);
  getNearbySites();
}
