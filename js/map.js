/* global L */
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

Leaflet.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
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
