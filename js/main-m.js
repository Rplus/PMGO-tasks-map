import centerMark from './center-mark.js';
import getLineInfo from './u/get-Line-info.js';
import reportDialog from './dialog.js';
import ctrl from './ctrls.js';
import map from './map.js';

window.info = {
  nowlatlng: {}
};

let LineInfo;

getLineInfo().then(d => LineInfo = d)
document.body.appendChild(ctrl);

// console.log(getPosition());
// console.log(centerMark);
// console.log({LineInfo});
