import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve } from 'path';

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
let patch1 = fsGraph.compute(fileEntries);

fsGraph.printGraph();

let end = fileEntries.length - 2;
let patch2 = fsGraph.compute(fileEntries.slice(0, end));

fsGraph.printGraph();

let patch3 = fsGraph.compute(fileEntries);

fsGraph.printGraph();
