const inline = (it) => it;
const arr = [1, 2, 3, 4, 5];
const res = (function () {
  let $ret_1 = true;
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    if (!((it) => it > 3)($it_1, $idx_1)) {
      return false;
    }
  }
  return $ret_1;
})();
console.log(res);
