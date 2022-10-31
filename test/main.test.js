const fs = require('fs');
const path = require('path');
const prettier = require('prettier')
const { transformAsync } = require('@babel/core')
const pluginPath = path.resolve(__dirname, '../index')
const cp = require('child_process')
const promisify = require('util').promisify
const plugin = [pluginPath, {}]
const execAsync = promisify(cp.exec)

function prettify(src) {
    return prettier.format(src.trim(), { parser: 'babel' });
}

async function runFile(file) {
    return await execAsync(`node ${file}`)
}

async function transformCode(code) {
    const { code: transpiled } = await transformAsync(code, {
        plugins: [plugin],
        babelrc: false,
    })
    
    return prettify(transpiled);
}
const files = fs.readdirSync(path.join(__dirname, '../test/samples'));

describe('Snapshots', () => {
    for (const file of files) {
        const snapshotFile = path.join(__dirname, '../test/snapshots', file.split('.')[0] + '.snap.js')
        const sampleFile = path.join(__dirname, '../test/samples', file);

        const sampleFileContents =  fs.readFileSync(sampleFile).toString('utf-8');
        const snapshotFileContents =  fs.readFileSync(snapshotFile).toString('utf-8');

        describe(snapshotFile, () => {
            it(`sample matches snapshot`, async () => {
                const transformedCode = await transformCode(await sampleFileContents);
                expect(transformedCode).toEqual(await snapshotFileContents);
            });
    
            it(`transpiled code generates the same output as sample`, async () => {
                const [
                    expectedOutput,
                    actualOutput
                ] = await Promise.all([
                    runFile(sampleFile),
                    runFile(snapshotFile)
                ]);
    
                expect(actualOutput).toEqual(expectedOutput);
            });
        })

    }
});
