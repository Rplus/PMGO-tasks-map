import { navigation, imgProxy } from './u/u.js';

export default function createMarkerContent(report) {
  let task = report.task.split('：');
  let googleNavigation = navigation(
    `${report.lat},${report.lng}`,
    `${window.info.nowlatlng.lat},${window.info.nowlatlng.lng}`
  );

  return `
    <div class='pokestops'>
      <h3>${report.site_name}</h3>
      <hr>
      <h4>${task[0]}</h4>
      <div>
        ${report['T&F'].T} ✔️ / ${report['T&F'].F} ❌
      </div>
      <div class="crop">
        <img src="${
          imgProxy(
            report.image,
            false,
            '&w=70&h=70&filt=greyscale&trim=10&t=squaredown&q=10&il'
          )}" />
      </div>
      <br>
      <a href="${googleNavigation}" target="_blank">google 👣</a>'
    </div>
  `;
};