import map from './map.js';
import createMarkerContent from './create-mark-content.js';

export function setMark(report) {
  if (
    isNaN(report.lat) ||
    isNaN(report.lng) ||
    !report.site_name ||
    !report.task ||
    !report['T&F']
  ) {
    console.warn('gg report', { report });
    return;
  }

  // report.done = doneTasks[`${report.lat},${report.lng}`];
  let task = report.task.split('：');
  let isDoubtful = report['T&F'].F > report['T&F'].T;
  let popupContent = createMarkerContent(report);

  if (!window.info.taskIcons[task[1]]) {
    console.warn('no icon', report);
    return;
  }

  let marker = Leaflet.marker(
    [report.lat, report.lng],
    {
      icon: window.info.taskIcons[task[1]],
      title: report.site_name,
      report: report,
    }
  )
  .addTo(map)
  .bindPopup(popupContent);

  if (isDoubtful) {
    console.info({ Doubtful: marker });
    marker._icon.classList.add('is-doubtful');
  }

  // if (report.done) {
  //   marker._icon.classList.toggle('is-done', report.done);
  // }

  window.markers.set(`${report.lat},${report.lng}`, marker);
}