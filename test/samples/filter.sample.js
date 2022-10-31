const inline = it => it;

const arr = [1, 2, 3, 4, 5];
const res = inline(
    arr.filter(it => it % 2 === 0)
);

console.log(res)
