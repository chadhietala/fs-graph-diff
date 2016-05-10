import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve } from 'path';
import { entry } from './helpers';
import FSTreeDiff = require('fs-tree-diff');
import {
  copySync,
  appendFileSync,
  unlinkSync,
  readFileSync,
  writeFileSync
} from 'fs-extra';

let fixtures = resolve('./test/fixtures/app');
let fileEntries = entries(fixtures);

let fsGraph = new FSGraph({
  srcDir: fixtures,
  namespace: 'dummy' // Maybe we can make this happen for free?
});

let patch1 = fsGraph.calculatePatch(fileEntries);

fsGraph.printGraph();

console.log('Initial Add:\n', patch1);

let end = fileEntries.length - 2;
let patch2 = fsGraph.calculatePatch(fileEntries.slice(0, end));

console.log('Removal:\n', patch2);

fsGraph.printGraph();

// Reset
let patch3 = fsGraph.calculatePatch(fileEntries);

console.log('Addition:\n', patch3);

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

console.log('Update:\n', patch4);

fsGraph.printGraph();

//Reset
let patch5 = fsGraph.calculatePatch(fileEntries);

console.log('Addition:\n', patch5);

fsGraph.printGraph();

let pristine = readFileSync('./test/fixtures/app/dummy/routes/application.ts', 'utf8');
let modified = readFileSync('./test/fixtures/modified/application.ts', 'utf8');

writeFileSync('./test/fixtures/app/dummy/routes/application.ts', modified);

let addedEntries = entries(fixtures);

let patch6;
try {
  patch6 = fsGraph.calculatePatch(addedEntries);
  console.log('Edge Addition:\n', patch6);
  fsGraph.printGraph();
} catch (e) {
  writeFileSync('./test/fixtures/app/dummy/routes/application.ts', pristine);
  throw e;
}

writeFileSync('./test/fixtures/app/dummy/routes/application.ts', pristine);

// Reset
let patch7 = fsGraph.calculatePatch(fileEntries);

console.log('Reset:\n', patch7);

fsGraph.printGraph();



