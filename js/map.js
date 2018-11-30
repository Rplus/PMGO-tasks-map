/* global L */
import getPosition from './u/get-position.js';
import { getData } from './get-data.js';

window.Leaflet = window.L;
const map = Leaflet.map('map', {
  zoomControl: false,
});

L.control.zoom({position: 'bottomright'}).addTo(map);

fetch('./service-worker.js')
.then(d => d.text())
.then(swjs => {
  let version = swjs.match(/(?:precache)-([^']+)/);
  if (!version) { return; }
  map.attributionControl.addAttribution(version[1]);
});


let position = getPosition();

map
  .on('moveend', setPosition)
  .on('moveend', renderMarkersInView)
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


let markersInView = [];

export function renderMarkersInView() {
  let bounds = map.getBounds();

  let checkInView = (_marker, _latLng) => {
    let inView = bounds.contains(L.latLng.apply(null, _latLng.split(',')));

    if (inView) {
      markersInView.push(_marker);
      _marker.addTo(map);
      if (_marker.isDoubtful) {
        _marker._icon && _marker._icon.classList.add('is-doubtful');
      }
    }
    return inView;
  };

  if (window.markers) {
    earseMarkers(markersInView); // clear markers in view at first
    markersInView = [];
    window.markers.forEach(checkInView);
  }
}


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
