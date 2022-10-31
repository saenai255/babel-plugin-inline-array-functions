const inline = it => it;

const arr = [1, 2, 3, 4, 5];
const res = inline(
    arr.map((it, i) => it * 2 * i)
);

console.log(res)
