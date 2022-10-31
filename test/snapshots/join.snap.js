const inline = (it) => it;
const arr = [1, 2, 3, 4, 5];
let res = (function () {
  let $ret_1 = "";
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    const $sep_1 = ",";
    $ret_1 = $ret_1 + (($ret_1.length === 0 ? "" : $sep_1) + $it_1);
  }
  if ($ret_1.endsWith(",")) {
    $ret_1 = $ret_1.substring(0, $ret_1.length - ",".length);
  }
  return $ret_1;
})();
console.log(res);
res = (function () {
  let $ret_1 = "";
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    const $sep_1 = ",";
    $ret_1 = $ret_1 + (($ret_1.length === 0 ? "" : $sep_1) + $it_1);
  }
  if ($ret_1.endsWith(",")) {
    $ret_1 = $ret_1.substring(0, $ret_1.length - ",".length);
  }
  return $ret_1;
})();
console.log(res);
