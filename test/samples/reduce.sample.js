const inline = it => it;

const arr = [1, 2, 3, 4, 5];
const res = inline(
    arr.reduce((sum, it) => sum + it, 0)
);

console.log(res);
