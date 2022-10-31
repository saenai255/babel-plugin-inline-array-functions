const inline = (it) => it;
const arr = [1, 2, 3, 4, 5];
const res = (function () {
  let $ret_1 = [];
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    $ret_1.push(((it, i) => it * 2 * i)($it_1, $idx_1));
  }
  return $ret_1;
})();
console.log(res);
