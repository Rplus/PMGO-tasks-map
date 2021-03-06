import { urls } from './u/urls.js';
import * as u from './u/u.js';
import { setMark } from './set-mark.js';
import { earseMarkers } from './map.js';
import { renderMarkersInView } from './map.js';

export let taskIcons;
export const getTasks = u.fetchJSON(`${urls.macros}?method=get_tasks`);
// const getTasksFull = u.fetchJSON(`${urls.macros}?method=get_tasks_full`);
// const getExistingData = u.fetchJSON(`${urls.macros}?method=get_existing_data`);


function getIcons(tasks) {
  let size = document.documentElement.clientWidth > 960 ? 48 : 32;
  window.info.taskIcons = tasks.reduce((all, task) => {
    all[task] = Leaflet.icon({
      iconUrl: `${urls.imgHost}/${task}_.png`,
      iconSize: [size, size], // size of the icon
      iconAnchor: [size / 2, size / 2], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -size / 3] // point from which the popup should open relative to the iconAnchor
    });
    return all;
  }, {});
};


export function getData() {
  console.log('re-fetching~~~');

  u.checkLastDay();
  if (window.markers) {
    earseMarkers(window.markers);
  }

  Promise.all([
    u.fetchJSON(`${urls.macros}?method=get_tasks`),
    u.fetchJSON(`${urls.macros}?method=get_existing_data`),
  ])
  .then(d => {
    let tasks = d[0];
    getIcons(tasks);
    // updateReportTasks(d[2]);

    window.markers = new Map();
    let reports = d[1];
    reports.forEach(setMark);
    renderMarkersInView();
  });
}
