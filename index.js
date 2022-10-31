/*
BSD 2-Clause License

Copyright (c) 2022, Paul Cosma
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

module.exports = function ({ types }, options) {
    return {
        visitor: {
            CallExpression(path) {
                const /** @type {import("@babel/types")} */ t = types;
                if (path.node.callee.type !== 'Identifier' && path.node.callee.name !== 'inline') {
                    return
                }

                if (path.node.arguments[0].type !== 'CallExpression') {
                    return
                }

                const uniqueName = (() => {
                    let idxs = Object.create(null);
                    return (prefix) => {
                        if (!idxs[prefix]) {
                            idxs[prefix] = 0;
                        }

                        idxs[prefix] += 1;
                        return `$${prefix}_${idxs[prefix]}`
                    }
                })()

                let funcs = [];
                let arrayNode = null
                const itName = uniqueName('it')
                const outName = uniqueName('ret')
                const idxName = uniqueName('idx')
                let callExpr = path.node.arguments[0];
                let currentIdxName = idxName;
                while (callExpr) {
                    let otherParams = callExpr.arguments.slice(1)
                    funcs.push({
                        name: callExpr.callee.property.name,
                        fn: callExpr.arguments[0],
                        otherParams
                    })

                    callExpr = callExpr.callee.object
                    if (callExpr.type !== 'CallExpression') {
                        arrayNode = callExpr
                        break
                    }
                }

                const stmtsRoot = [];
                let stmts = stmtsRoot;
                let outInitialValue = t.identifier('undefined')
                let beforeReturnStatement = t.emptyStatement();
                let beforeLoopStatement = [];
                while (funcs.length > 0) {
                    const { name, fn, otherParams } = funcs.pop();
                    const shouldCollect = funcs.length === 0;

                    switch (name) {
                        case 'find': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .find')
                            }

                            stmts.push(
                                t.ifStatement(t.callExpression(fn, [
                                    t.identifier(itName),
                                    t.identifier(currentIdxName)
                                ]), t.blockStatement([
                                    t.returnStatement(
                                        t.identifier(itName)
                                    )
                                ]))
                            );

                            break;
                        }
                        case 'includes': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .find')
                            }

                            outInitialValue = t.booleanLiteral(false);
                            stmts.push(
                                t.ifStatement(
                                    t.binaryExpression(
                                        '===',
                                        t.identifier(itName),
                                        fn
                                    ),
                                    t.blockStatement([
                                        t.returnStatement(
                                            t.booleanLiteral(true)
                                        )
                                    ]))
                            );

                            break;
                        }
                        case 'every': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .every')
                            }

                            outInitialValue = t.booleanLiteral(true)
                            stmts.push(
                                t.ifStatement(
                                    t.unaryExpression(
                                        '!',
                                        t.callExpression(fn, [
                                            t.identifier(itName),
                                            t.identifier(currentIdxName)
                                        ])
                                    ),
                                    t.blockStatement([
                                        t.returnStatement(
                                            t.booleanLiteral(false)
                                        )
                                    ])
                                )
                            )
                            break;
                        }
                        case 'some': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .some')
                            }

                            outInitialValue = t.booleanLiteral(false)
                            stmts.push(
                                t.ifStatement(
                                    t.callExpression(fn, [
                                        t.identifier(itName),
                                        t.identifier(currentIdxName)
                                    ]),
                                    t.blockStatement([
                                        t.returnStatement(
                                            t.booleanLiteral(true)
                                        )
                                    ])
                                )
                            )
                            break;
                        }
                        case 'reduce': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .reduce')
                            }
                            outInitialValue = otherParams[0]
                            stmts.push(
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        '=',
                                        t.identifier(outName),
                                        t.callExpression(fn, [
                                            t.identifier(outName),
                                            t.identifier(itName)
                                        ])
                                    )
                                ),

                            )
                            break;
                        }
                        case 'join': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .join')
                            }
                            const separator = otherParams.length === 1 ? t.logicalExpression(
                                '??',
                                otherParams[0] || t.identifier('undefined'),
                                t.stringLiteral(',')
                            ) : t.stringLiteral(',');
                            const separatorName = uniqueName('sep');
                            outInitialValue = t.stringLiteral('');
                            stmts.push(
                                t.variableDeclaration(
                                    'const',
                                    [t.variableDeclarator(
                                        t.identifier(separatorName),
                                        separator
                                    )]
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        '=',
                                        t.identifier(outName),
                                        t.binaryExpression(
                                            '+',
                                            t.identifier(outName),
                                            t.binaryExpression(
                                                '+',
                                                t.conditionalExpression(
                                                    t.binaryExpression(
                                                        '===',
                                                        t.memberExpression(
                                                            t.identifier(outName),
                                                            t.identifier('length')
                                                        ),
                                                        t.numericLiteral(0)
                                                    ),
                                                    t.stringLiteral(''),
                                                    t.identifier(separatorName)
                                                ),
                                                t.identifier(itName)
                                            )
                                        )
                                    )
                                ),
                            )

                            beforeReturnStatement = t.ifStatement(
                                t.callExpression(
                                    t.memberExpression(t.identifier(outName), t.identifier('endsWith')),
                                    [separator]
                                ),
                                t.blockStatement([
                                    t.expressionStatement(
                                        t.assignmentExpression(
                                            '=',
                                            t.identifier(outName),
                                            t.callExpression(
                                                t.memberExpression(
                                                    t.identifier(outName),
                                                    t.identifier('substring')
                                                ),
                                                [t.numericLiteral(0), t.binaryExpression(
                                                    '-',
                                                    t.memberExpression(
                                                        t.identifier(outName),
                                                        t.identifier('length')
                                                    ),
                                                    t.memberExpression(
                                                        separator,
                                                        t.identifier('length')
                                                    )
                                                )]
                                            )
                                        )
                                    )
                                ])
                            )
                            break;
                        }
                        case 'filter': {
                            if (shouldCollect) {
                                outInitialValue = t.arrayExpression([])
                                stmts.push(
                                    t.ifStatement(
                                        t.callExpression(fn, [
                                            t.identifier(itName),
                                            t.identifier(currentIdxName)
                                        ]),
                                        t.blockStatement([
                                            t.expressionStatement(
                                                t.callExpression(
                                                    t.memberExpression(
                                                        t.identifier(outName),
                                                        t.identifier('push')
                                                    ),
                                                    [t.identifier(itName)]
                                                )
                                            )
                                        ])
                                    )
                                )
                            } else {
                                const curIdx = uniqueName('curIdx')
                                const scope = [t.expressionStatement(
                                    t.assignmentExpression(
                                        '+=',
                                        t.identifier(curIdx),
                                        t.numericLiteral(1)
                                    )
                                )];

                                stmts.push(
                                    t.ifStatement(
                                        t.callExpression(fn, [
                                            t.identifier(itName),
                                            t.identifier(currentIdxName)
                                        ]),
                                        t.blockStatement(scope)
                                    )
                                );

                                stmts = scope;

                                currentIdxName = curIdx;
                                beforeLoopStatement.push(
                                    t.variableDeclaration(
                                        'let',
                                        [t.variableDeclarator(
                                            t.identifier(currentIdxName),
                                            t.numericLiteral(-1)
                                        )]
                                    )
                                )
                            }
                            break;
                        }
                        case 'map': {
                            if (shouldCollect) {
                                outInitialValue = t.arrayExpression([])
                                stmts.push(
                                    t.expressionStatement(
                                        t.callExpression(
                                            t.memberExpression(
                                                t.identifier(outName),
                                                t.identifier('push')
                                            ),
                                            [t.callExpression(fn, [
                                                t.identifier(itName),
                                                t.identifier(currentIdxName)
                                            ])]
                                        )
                                    )
                                )
                            } else {
                                stmts.push(
                                    t.expressionStatement(
                                        t.assignmentExpression(
                                            '=',
                                            t.identifier(itName),
                                            t.callExpression(fn, [
                                                t.identifier(itName),
                                                t.identifier(currentIdxName)
                                            ])
                                        )
                                    ),
                                )
                            }
                            break;
                        }
                        case 'forEach': {
                            if (!shouldCollect) {
                                throw new Error('cannot chain of .forEach')
                            }

                            stmts.push(
                                t.expressionStatement(
                                    t.callExpression(fn, [
                                        t.identifier(itName),
                                        t.identifier(currentIdxName)
                                    ])
                                ),
                            )
                            break;
                        }
                        default: {
                            throw new Error(`Array method '${name}' can't be inlined.
Hint: Try changing the code from looking like this 'inline(myArray.map(..).${name}(..))' to 'inline(myArray.map(..)).${name}(..)'.
\t=> ${arrayNode.loc.filename || '<stdin>'}:${arrayNode.loc.end.line}:${arrayNode.loc.end.column}`)
                        }
                    }
                }

                let expr = t.callExpression(
                    t.functionExpression(null, [], t.blockStatement([
                        t.variableDeclaration(
                            'let',
                            [t.variableDeclarator(
                                t.identifier(outName),
                                outInitialValue
                            )]
                        ),
                        ...beforeLoopStatement,
                        t.forStatement(
                            t.variableDeclaration(
                                'let',
                                [t.variableDeclarator(
                                    t.identifier(idxName),
                                    t.numericLiteral(0)
                                )],
                            ),
                            t.binaryExpression(
                                '<',
                                t.identifier(idxName),
                                t.memberExpression(
                                    arrayNode,
                                    t.identifier('length')
                                )
                            ),
                            t.assignmentExpression(
                                '+=',
                                t.identifier(idxName),
                                t.numericLiteral(1)
                            ),
                            t.blockStatement([
                                t.variableDeclaration(
                                    'let',
                                    [t.variableDeclarator(
                                        t.identifier(itName),
                                        t.memberExpression(
                                            arrayNode,
                                            t.identifier(idxName),
                                            true
                                        )
                                    )]
                                ),
                                ...stmtsRoot
                            ])
                        ),
                        beforeReturnStatement,
                        t.returnStatement(
                            t.identifier(outName)
                        )
                    ])),
                    []
                )

                path.replaceWith(expr);
            }
        }
    }
}
