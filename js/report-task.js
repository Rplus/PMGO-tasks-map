import reportDialog from './dialog.js';
import map from './map.js';
import * as u from './u/u.js';
import { urls } from './u/urls.js';
import { setMark } from './set-mark.js';
import { renderMarkersInView } from './map.js';
import { notify } from './notify.js';

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

  let center = map.getCenter();
  sites.forEach(site => {
    site.d = center.distanceTo([site.poke_lat, site.poke_lng]);
  });
  sites.sort((a, b) => a.d - b.d);

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

  let [
    pokestop,
    lat,
    lng,
    image,
  ] = reportDialog.reportSite.value.split(splitChar);
  let task = reportDialog.reportTask.value;

  if (!task) { return; }

  let postInfo = {
    LineID: window.info.LineInfo.userId,
    task,
    pokestop,
    lat,
    lng,
    image,
  };

  let postParams = new URLSearchParams(postInfo);

  reportDialog.close();

  fetch(urls.reportTask, {
    method: 'POST',
    body: postParams.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(u.toJSON)
  .then(d => {
    if (d.success){
      setMark({
        ...postInfo,
        site_name: pokestop,
        address: '',
        'T&F': { T: 0, F: 0 },
      });
      renderMarkersInView();

      if (document.hidden) {
        notify('👍 report success!');
      }
    } else {
      alert(d.msg || 'GG');
    }
  });
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
