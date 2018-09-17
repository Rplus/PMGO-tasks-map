import map from './map.js';

function createLocateBtn() {
  let dom = document.createElement('button');
  dom.id = 'locate-me';
  dom.innerText = '⦿';
  dom.addEventListener('click', locateMe);
  return dom;
}

function locateMe() {
  map.locate({
    setView: true,
    maxZoom: 16
  });
}

let locateMeBtn = createLocateBtn();

export default locateMeBtn;
