const inline = (it) => it;
const log = (it, i) =>
  console.log({
    it,
    i,
  });
const arr = [1, 2, 3, 4, 5];
(function () {
  let $ret_1 = undefined;
  for (let $idx_1 = 0; $idx_1 < arr.length; $idx_1 += 1) {
    let $it_1 = arr[$idx_1];
    log($it_1, $idx_1);
  }
  return $ret_1;
})();
