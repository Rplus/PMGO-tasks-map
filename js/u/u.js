export function toJSON(d) {
  return d.json();
};


export function fetchJSON(url) {
  return fetch(url).then(toJSON);
};


export function navigation(targetLngLat, nowLngLat) {
  if (navigator.userAgent.match(/android/i)) {
    return `google.navigation:q=${targetLngLat}&mode=w`;
  } else if (nowLngLat == 'undefined,undefined') {
    return `http://maps.google.com?q=${targetLngLat}`;
  } else {
    if (navigator.userAgent.match(/(iphone|ipod|ipad);?/i)) {
      return `comgooglemaps://?saddr=&daddr=${targetLngLat}&directionsmode=Driving&zoom=15`;
    } else {
      return `https://www.google.com.tw/maps/dir/${targetLngLat}/${nowLngLat}/@24,120.5,10z/data=!3m1!4b1!4m2!4m1!3e0`;
    }
  };
  return '';
}


export function checkLastDay() {
  let today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  console.log(`today: ${today}`);
  if (localStorage.getItem('doneTasks-lastday') !== today) {
    localStorage.removeItem('doneTasks');
    localStorage.setItem('doneTasks-lastday', today);
  }
}


export function imgProxy(
  src,
  keepProtocol = true,
  props = '&width=300'
) {
  let url = keepProtocol ? src : src.replace(/^https?\:\/\//g, '');
  // return `https://imageproxy.pimg.tw/zoomcrop?url=${url}${props}`;
  return `http://images.weserv.nl/?url=${url}${props}`;
}


export function generateOptions(options) {
  return options.map((option = { value: '', label: ''}) => {
    return (
      `<option
        value="${option.value}"
        label="${option.label}"
      >${option.text || ''}</option>`
    );
  });
}