// (function (window, Leaflet) {
  Leaflet = L;
  const imgHost = 'https://5upergeo.github.io/PMGO-tasks-map/img';
  const url = 'https://script.google.com/macros/s/AKfycbyOkCaKC-q75jN8NPx4oxLvkcIyEJLDGZDKUuAZ_Rl9JufGr1Uf/exec';

  let position = getPosition();
  let mapLatLng = position.latLng;
  let mapZoom = position.zoom;

  let map = Leaflet.map('map');

  let taskIcon = {};
  let nowlatlng = {};
  let markers;

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
    let task = report.task.split('：');
    let googleNavigation = navigation(
      `${report.lat},${report.lng}`,
      `${nowlatlng.lat},${nowlatlng.lng}`
    );
    let popupContent = `
      <div class='pokestops'>
        <h3>${report.site_name}</h3>
        <hr>
        <h4>${task[0]}</h4>
        <div>
          ${report['T&F'].T} ✔️ / ${report['T&F'].F} ❌
          <br>
          <small>回報確認數</small>
        </div>
        <div class="crop">
          <img src="http://images.weserv.nl/?url=${report.image.replace(/^https?\:\/\//g, '')}&w=70&h=70&filt=greyscale&il&trim=10&t=squaredown">
        </div>
        <br>
        <a href="${googleNavigation}" target="_blank">google 👣</a>'
      </div>
    `;
    let marker = Leaflet.marker(
      [report.lat, report.lng],
      { icon: taskIcon[task[1]] }
    )
    .addTo(map)
    .bindPopup(popupContent);

    markers.push(marker);
  };

  function earseMarkers(markers) {
    markers.forEach(m => map.removeLayer(m));
  }

  function getData() {
    if (markers) {
      earseMarkers(markers);
    }

    Promise.all([getTasks(), getExistingData() ])
    .then(d => {
      let tasks = d[0];
      getIcons(tasks);

      markers = [];
      let reports = d[1];
      reports.forEach(setMark);
    });
  }

  function generateFilters() {
    getTasks().then((tasks) => {
      console.log({tasks});
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

// })(window, L);
