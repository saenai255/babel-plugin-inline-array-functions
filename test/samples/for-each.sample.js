const inline = it => it;
const log = (it, i) => console.log({ it, i })

const arr = [1, 2, 3, 4, 5];
inline(
    arr.forEach(log)
);
