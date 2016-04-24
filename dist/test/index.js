"use strict";
const _1 = require('../');
const walk_sync_1 = require('walk-sync');
const path_1 = require('path');
let tmp = path_1.resolve('./tmp-dir');
let fixtures = path_1.resolve('./test/app');
let fileEntries = walk_sync_1.entries(fixtures);
let fsGraph = new _1.default({
    root: process.cwd(),
    namespace: 'dummy',
    srcDir: fixtures,
    destDir: tmp
});
/**
 * Just sends out connected input paths
 *
 *
 * ['', 'foo.js']
 * ['']
 */
let patch1 = fsGraph.compute(fileEntries);
let end = fileEntries.length - 2;
let patch2 = fsGraph.compute(fileEntries.slice(0, end));
fsGraph.printGraph();
//# sourceMappingURL=index.js.map