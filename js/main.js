// (function (window, Leaflet) {
  Leaflet = L;
  const imgHost = 'https://5upergeo.github.io/PMGO-tasks-map/img';
  const url = 'https://script.google.com/macros/s/AKfycbyOkCaKC-q75jN8NPx4oxLvkcIyEJLDGZDKUuAZ_Rl9JufGr1Uf/exec';
  const return_task_url = 'https://script.google.com/macros/s/AKfycbzMvd730XVRRCoEL13052qsOC81kwPKeWRWZJV9B60e59nXCDLZ/exec';

  let imgProxy = (src, keepProtocol = true, props = '&width=300') => {
    let url = keepProtocol ? src : src.replace(/^https?\:\/\//g, '');
    // return `https://imageproxy.pimg.tw/zoomcrop?url=${url}${props}`;
    return `http://images.weserv.nl/?url=${url}${props}`;
  };

  let position = getPosition();
  let mapLatLng = position.latLng;
  let mapZoom = position.zoom;
  let doneTasks = getDoneTasks();

  let map = Leaflet.map('map');
  map.attributionControl.addAttribution('u:2018-09-14');

  let taskIcon = {};
  let nowlatlng = {};
  let markers;

  let LineID = '';
  function getLineID() {
    let idFromStorage = localStorage.getItem('LineID');
    let idFromURL = new URLSearchParams(location.search).get('LineID');
    if (idFromURL) {
      LineID = idFromURL;
      localStorage.setItem('LineID', idFromURL);
    } else if (idFromStorage) {
      LineID = idFromStorage;
    }
  };
  getLineID();

  generateFilters();
  document.getElementById('locate-me').addEventListener('click', locateMe);
  document.getElementById('re-fetch').addEventListener('click', getData);

  map
    .on('moveend', setPosition)
    .on('load', onLoad)
    .on('locationfound', onLocationFound)
    .on('locationerror', onLocationError)
    .setView(mapLatLng, mapZoom)

  Leaflet.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(map);

  function getPosition() {
    const urlParams = new URLSearchParams(location.search);

    const lat = urlParams.get('lat') || localStorage.getItem('lat') || 25.052920;
    const lng = urlParams.get('lng') || localStorage.getItem('lng') || 121.556237;
    const zoom = urlParams.get('zoom') || localStorage.getItem('zoom') || 15;

    return {
      latLng: [+lat, +lng],
      zoom: +zoom,
    };
  };

  function onLoad() {
    getData();
    setPosition();
  }

  function setPosition() {
    if (!map) { return; }

    let geo = map.getCenter();
    let [lat, lng] = [geo.lat, geo.lng];

    localStorage.setItem('lat', lat);
    localStorage.setItem('lng', lng);
    localStorage.setItem('zoom', map.getZoom());
  };

  function locateMe() {
    map.locate({
      setView: true,
      maxZoom: 16
    });
  }

  function onLocationFound(e) {
    nowlatlng = e.latlng;
    const radius = e.accuracy / 2;
    if (map.circle) {
      map.removeLayer(map.circle);
    }
    map.circle = Leaflet.circle(e.latlng, radius).addTo(map);
  };

  function onLocationError(e) {
    console.warn(e.message);
    document.title = `[GG] - ${document.title}`;
  };

  //導航連結
  function navigation(LngLat, GPSLocation) {
    if (navigator.userAgent.match(/android/i)) {
      return `google.navigation:q=${LngLat}&mode=w`;
    } else if (GPSLocation == 'undefined,undefined') {
      return `http://maps.google.com?q=${LngLat}`;
    } else {
      if (navigator.userAgent.match(/(iphone|ipod|ipad);?/i)) {
        return `comgooglemaps://?saddr=&daddr=${LngLat}&directionsmode=Driving&zoom=15`;
      } else {
        return `https://www.google.com.tw/maps/dir/${LngLat}/${GPSLocation}/@24,120.5,10z/data=!3m1!4b1!4m2!4m1!3e0`;
      }
    };
    return "";
  }

  function getTasks() {
    return fetch(`${url}?method=get_tasks`).then(d => d.json());
  };

  function getTasksFull() {
    return fetch(`${url}?method=get_tasks_full`).then(d => d.json());
  };

  function getExistingData() {
    return fetch(`${url}?method=get_existing_data`).then(d => d.json());
  }

  function getIcons(tasks) {
    taskIcon = tasks.reduce((all, task) => {
      all[task] = Leaflet.icon({
        iconUrl: `${imgHost}/${task}_.png`,
        iconSize: [48, 48], // size of the icon
        iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -18] // point from which the popup should open relative to the iconAnchor
      });
      return all;
    }, {});
  };

  function setMark(report) {
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

    report.done = doneTasks[`${report.lat},${report.lng}`];
    let task = report.task.split('：');
    let isDoubtful = report['T&F'].F > report['T&F'].T;
    let popupContent = createMarkerContent(report);
    let marker = Leaflet.marker(
      [report.lat, report.lng],
      {
        icon: taskIcon[task[1]],
        title: report.site_name,
        report: report,
      }
    )
    .addTo(map)
    .on('click', updateMarkerContent)
    .bindPopup(popupContent);

    if (isDoubtful) {
      console.info({ Doubtful: marker });
      marker._icon.classList.add('is-doubtful');
    }

    if (report.done) {
      marker._icon.classList.toggle('is-done', report.done);
    }

    // markers.push(marker);
    markers.set(`${report.lat},${report.lng}`, marker);
  };

  function createMarkerContent(report) {
    let task = report.task.split('：');
    let googleNavigation = navigation(
      `${report.lat},${report.lng}`,
      `${nowlatlng.lat},${nowlatlng.lng}`
    );
    return `
      <div class='pokestops'>
        <h3>${report.site_name}</h3>
        <hr>
        <h4>${task[0]}</h4>
        <div>
          ${report['T&F'].T} ✔️ / ${report['T&F'].F} ❌
          <br>
          <small>回報確認數</small>
          <br>
          <label>
          <input type="checkbox" data-latlng="${report.lat},${report.lng}" ${report.done ? "checked": ''} /> 已完成
          </label>
        </div>
        <div class="crop">
          <img src="${imgProxy(report.image, false, '&w=70&h=70&filt=greyscale&trim=10&t=squaredown&q=10&il')}" />
        </div>
        <br>
        <a href="${googleNavigation}" target="_blank">google 👣</a>'
      </div>
    `;
  };

  function updateMarkerContent() {
    this.setPopupContent(createMarkerContent(this.options.report))
  }

  function earseMarkers(markers) {
    markers.forEach(m => map.removeLayer(m));
  }

  function getData() {
    checkLastDay();
    if (markers) {
      earseMarkers(markers);
    }

    Promise.all([getTasks(), getExistingData(), getTasksFull()])
    .then(d => {
      let tasks = d[0];
      getIcons(tasks);
      updateReportTasks(d[2]);

      markers = new Map();
      let reports = d[1];
      reports.forEach(setMark);
    });
  }

  function generateFilters() {
    getTasks().then((tasks) => {
      let dom = tasks.reduce((all, task) => {
        all.input.push(`<input type="checkbox" class="ckbox-filter" id="ckbox_${task}" checked />`);
        all.label.push(`<label for="ckbox_${task}"><img src="${imgHost}/${task}_.png" title="${task}" /></label>`);
        all.style.push(`
          #ckbox_${task}:not(:checked) ~ #map img[src$="/${task}_.png"] { display: none; }
          #ckbox_${task}:not(:checked) ~ .ctrl img[src$="/${task}_.png"] { filter: contrast(0%); }
        `);
        return all;
      }, { input: [], label: [], style: [] });

      let filter = document.querySelector('.filters');
      let style = document.createElement('style');
      style.innerHTML = dom.style.join('');
      filter.innerHTML = dom.label.join('');
      filter.insertAdjacentElement('afterbegin', style);
      document.querySelector('#map').insertAdjacentHTML('beforebegin', dom.input.join(''));
    });
  }

  function setDoneTasks(tasksLatLng, isDone = true) {
    doneTasks[tasksLatLng] = isDone;
    localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
  }

  function checkLastDay() {
    let today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    console.log(`today: ${today}`);
    if (localStorage.getItem('doneTasks-lastday') !== today) {
      localStorage.removeItem('doneTasks');
      localStorage.setItem('doneTasks-lastday', today);
    }
  }

  function getDoneTasks() {
    checkLastDay();
    let tasks = localStorage.getItem('doneTasks') || "{}";
    return JSON.parse(tasks);
  }

  function checkTaskDone(e) {
    let input = e.target;
    if (!input || !input.dataset.latlng) {
      return;
    }
    let marker = markers.get(input.dataset.latlng);
    marker.options.report.done = input.checked;
    marker._icon.classList.toggle('is-done', input.checked);
    setDoneTasks(input.dataset.latlng, input.checked);
  }

  function getLineInfo() {
    if (!LineID) { return; }

    return fetch(`${return_task_url}?method=get_profile&LineID=${LineID}`)
    .then(d => d.json())
    .then(d => {
      if (d.success) {
        document.getElementById('task-reporter').innerText = d.displayName;
      } else {
        localStorage.removeItem('LineID');
        prompt('請透過加入Line機器人[oh?]，啟動回報權限。', 'https://line.me/R/ti/p/%40wbf4859b');
      }
      return d;
    });
  };
  getLineInfo();

  let el_dialog = document.getElementById('dialog');
  document.getElementById('close-dialog').addEventListener('click', closeDialog);
  function closeDialog() {
    el_dialog.close();
  };

  document.getElementById('add-report').addEventListener('click', addReport);
  function addReport() {
    if (!LineID) { return; }
    if (el_dialog.open) {
      closeDialog();
    }

    el_dialog.showModal();

    resetNearbySites();
    getNearbySites();
  };

  function resetNearbySites(params) {
    document.getElementById('report-site').innerHTML = '';
  };

  function getNearbySites() {
    let conter = map.getCenter();
    let dd = new Date().getDate() > 15 ? 3 : 1;
    let url = `https://pokestop-taiwan-${dd}.herokuapp.com/get_bbox_sites/${conter.lat}/${conter.lng}`;

    fetch(url)
      .then(d => d.json())
      .then(updateReportSites);
  }

  function updateReportSites(sites) {
    if (!sites) { return; }
    let optionsHtml = sites.map(site => `<option value="${site.poke_title}＠x＠${site.poke_lat}＠x＠${site.poke_lng}＠x＠${site.poke_image}" label="${site.poke_title}">`).join('');
    document.getElementById('report-site').innerHTML = optionsHtml;
  };

  function updateReportTasks(tasks) {
    if (!tasks) { return; }
    let optionsHtml = tasks.map(task => `<option value="${task}" label="${task}">`).join('');
    document.getElementById('report-task').innerHTML = optionsHtml;
  }

  document.getElementById('report-form').addEventListener('submit', returnTask);
  function returnTask(e) {
    e.preventDefault();
    if (this.title) { return; }
    this.title = 'proceed';

    let pokestop_info = document.getElementById('report-site').value.split('＠x＠');
    let task = document.getElementById('report-task').value;
    let postURL = new URLSearchParams({
      LineID,
      task,
      pokestop: pokestop_info[0],
      lat: pokestop_info[1],
      lng: pokestop_info[2],
      image: pokestop_info[3]
    });

    fetch(return_task_url, {
      method: "POST",
      body: postURL.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(d => d.json())
    .then(d => {
      this.title = '';
      if (d.success){
        setMark({
          task,
          site_name: pokestop_info[0],
          lat: pokestop_info[1],
          lng: pokestop_info[2],
          image: pokestop_info[3],
          address: '',
          'T&F': { T: 0, F: 0 },
        });
        // onLoad();
      } else {
        alert(d.msg || 'GG');
      }
      closeDialog();
    })
    .catch(() => {
      this.title = '';
    });
  };

  document.querySelector('#map').addEventListener('input', checkTaskDone);

// })(window, L);
