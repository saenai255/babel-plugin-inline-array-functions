const inline = it => it;

const arr = [1, 2, 3, 4, 5];
let res = inline(
    arr.join()
);

console.log(res)

res = inline(
    arr.join('-')
);

console.log(res)
