const inline = (it) => it;
const arr = [1, 2, 3, 4, 5];
const res = (function () {
  let $ret_1 = 0;
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    $ret_1 = ((sum, it) => sum + it)($ret_1, $it_1);
  }
  return $ret_1;
})();
console.log(res);
