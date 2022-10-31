const path                   = require('path')
const Prettier               = require('prettier')
const { transformAsync } = require('@babel/core')

const pluginPath = path.resolve(__dirname, './index')

function normalize (src) {
    return Prettier.format(src.trim(), { parser: 'babel' })
}

const code = `
/** @type {<T>(it: T) => T} */
const inline = it => it
const a = [1,2,3,4,5];
// const b = inline(
//     a
//     .map(it => it * 3)
//     .filter(it => inline(a.some(other => other == it)))
//     .join()
// );

// console.log(b)

inline(
    a
    .filter(it => it % 2 == 0)
    .map(it => it * 3)
    .filter(it => it % 2 == 0)
    .forEach(console.log)
)
`;

const plugin = [pluginPath, {}]
async function main() {
    const { code: transpiled } = await transformAsync(code, {
        plugins: [plugin],
        babelrc: false,
    })
    
    const got = normalize(transpiled)
    console.log(got)
}

main()
