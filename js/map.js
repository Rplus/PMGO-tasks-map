/* global L, localforage */
import getPosition from './u/get-position.js';
import { getData } from './get-data.js';

window.Leaflet = window.L;
const map = Leaflet.map('map');

map.attributionControl.addAttribution('u:2018-09-14');

let position = getPosition();

map
  .on('moveend', setPosition)
  .on('load', onLoad)
  .on('locationfound', onLocationFound)
  .on('locationerror', onLocationError)
  .setView(position.latLng, position.zoom)

let tilesDb = {
  getItem(key) {
    return localforage.getItem(key);
  },

  saveTiles(tileUrls) {
    let promises = tileUrls.map(tileUrl => {
      new Promise((resolve, reject) => {
        fetch(tileUrl.url)
        .then(d => d.blob())
        .then(d => {
          resolve(this._saveTile(tileUrl.key, d));
        })
        .catch(d => {
          reject({
            status: d.message,
            statusText: d.stack
          });
        })
      })
    });

    return Promise.all(promises);
  },

  clear() {
    return localforage.clear();
  },

  _saveTile(key, value) {
    return this._removeItem(key).then(function() {
      return localforage.setItem(key, value);
    });
  },

  _removeItem(key) {
    return localforage.removeItem(key);
  },
};

// // openstreetmap
// let offlineLayer = Leaflet.tileLayer.offline('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tilesDb,{
//     maxZoom: 20,
//     subdomains: 'abc',
//     minZoom: 13,
//     crossOrigin: true,
//   }).addTo(map);

// google map
let offlineLayer = Leaflet.tileLayer.offline('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', tilesDb,{
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    minZoom: 13,
    crossOrigin: true,
  }).addTo(map);

let offlineControl = Leaflet.control.offline(offlineLayer, tilesDb, {
  position: 'bottomright',
  saveButtonHtml: '存',
  removeButtonHtml: '刪',
  confirmSavingCallback(nTilesToSave, continueSaveTiles) {
    if (window.confirm(`存下 ${nTilesToSave} 張圖層？`)) {
      continueSaveTiles();
    }
  },
  confirmRemovalCallback(continueRemoveTiles) {
    if (window.confirm('移除所有已存圖層?')) {
      continueRemoveTiles();
    }
  },
  minZoom: 13,
  maxZoom: 19,
}).addTo(map);


function setPosition() {
  if (!map) { return; }

  let geo = map.getCenter();
  let [lat, lng] = [geo.lat, geo.lng];

  localStorage.setItem('lat', lat);
  localStorage.setItem('lng', lng);
  localStorage.setItem('zoom', map.getZoom());
};


function onLoad() {
  getData();
  setPosition();
};


function onLocationFound(e) {
  window.info.nowlatlng = e.latlng;
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


export default map;


export function earseMarkers(markers) {
  markers.forEach(m => map.removeLayer(m));
}
