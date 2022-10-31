const inline = (it) => it;
const arr = [1, 2, 3, 4, 5];
const res = (function () {
  let $ret_1 = false;
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    if ($it_1 === 3) {
      return true;
    }
  }
  return $ret_1;
})();
console.log(res);
