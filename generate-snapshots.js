const fs = require('fs/promises');
const path = require('path');
const prettier = require('prettier')
const { transformAsync } = require('@babel/core')
const pluginPath = path.resolve(__dirname, './index')
const plugin = [pluginPath, {}]

function prettify(src) {
    return prettier.format(src.trim(), { parser: 'babel' });
}

async function transformCode(code) {
    const { code: transpiled } = await transformAsync(code, {
        plugins: [plugin],
        babelrc: false,
    })
    
    return prettify(transpiled);
}

async function main() {
    const files = await fs.readdir(path.join(__dirname, './test/samples'));
    for (const file of files) {
        const fileContents = (await fs.readFile(path.join(__dirname, './test/samples', file))).toString('utf-8');
        const transformedCode = await transformCode(fileContents);
        await fs.writeFile(path.join(__dirname, './test/snapshots', file.split('.')[0] + '.snap.js'), transformedCode)
    }

}

main()
