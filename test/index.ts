import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve } from 'path';

let tmp = resolve('./tmp-dir');
let fixtures = resolve('./test/app');
let fileEntries = entries(fixtures);

let fsGraph = new FSGraph({
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
