import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve } from 'path';
import { entry } from './helpers';
import FSTreeDiff = require('fs-tree-diff');

let tmp = resolve('./tmp-dir');
let fixtures = resolve('./test/fixtures');
let fileEntries = entries(fixtures);


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


let patch4 = fsGraph.calculatePatch(updatedEntries);

fsGraph.printGraph();
