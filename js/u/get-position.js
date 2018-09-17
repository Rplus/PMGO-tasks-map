export default function getPosition() {
  const urlParams = new URLSearchParams(location.search);

  const lat = urlParams.get('lat') || localStorage.getItem('lat') || 25.052920;
  const lng = urlParams.get('lng') || localStorage.getItem('lng') || 121.556237;
  const zoom = urlParams.get('zoom') || localStorage.getItem('zoom') || 15;

  return {
    latLng: [+lat, +lng],
    zoom: +zoom,
  };
};