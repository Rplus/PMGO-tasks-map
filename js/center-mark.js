function createCenterMark() {
  let mark = document.createElement('span');
  mark.id = 'center-mark';
  document.body.appendChild(mark);
}

createCenterMark();
let centerMark = document.getElementById('center-mark');

export default centerMark;
