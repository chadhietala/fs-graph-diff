import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve } from 'path';
import { entry } from './helpers';
import FSTreeDiff = require('fs-tree-diff');
import { copySync, appendFileSync, unlinkSync, readFileSync } from 'fs-extra';

let tmp = resolve('./tmp-dir');
let fixtures = resolve('./test/fixtures');
let fileEntries = entries(fixtures);

copySync('./test/fixtures/dummy/routes/application.ts', './test/application.ts');
appendFileSync('./test/fixtures/dummy/routes/application.ts', 'import Bar from "../bar";\n');

let addedEntries = entries(fixtures);

let fsGraph = new FSGraph({
  srcDir: fixtures,
  destDir: tmp,
  namespace: 'dummy' // Maybe we can make this happen for free?
});

/**
 * Just sends out connected input paths
 *
 *
 * ['', 'foo.js']
 * ['']
 */
let patch1 = fsGraph.calculatePatch(fileEntries);

fsGraph.printGraph();

let end = fileEntries.length - 2;
let patch2 = fsGraph.calculatePatch(fileEntries.slice(0, end));

fsGraph.printGraph();

let patch3 = fsGraph.calculatePatch(fileEntries);

fsGraph.printGraph();

let updatedEntries = fileEntries.map((currentEntry, i) => {
  if (i === 1) {
    return entry({
      relativePath: currentEntry.relativePath
    })
  }
  return currentEntry;
});

// Idempotent
let patch4 = fsGraph.calculatePatch(updatedEntries);

fsGraph.printGraph();

// Reset
let patch5 = fsGraph.calculatePatch(fileEntries);

fsGraph.printGraph();

let patch6 = fsGraph.calculatePatch(addedEntries);

fsGraph.printGraph();

copySync('./test/application.ts', './test/fixtures/dummy/routes/application.ts');
unlinkSync('./test/application.ts');

// Reset
let patch7 = fsGraph.calculatePatch(fileEntries);

console.log(patch1);

fsGraph.printGraph();



