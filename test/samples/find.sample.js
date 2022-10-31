const inline = it => it;

const arr = [1, 2, 3, 4, 5];
const res = inline(
    arr.find(it => it > 3)
);

console.log(res);
