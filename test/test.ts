import test from 'ava';
import FSGraph from '../';
import { entries } from 'walk-sync';
import { resolve, relative } from 'path';
import mockfs = require('mock-fs');
import { patchInPlace } from 'mountfs';
import { mount, statSync } from 'fs';
import mkdirp = require('mkdirp');
import { makeOrRemake } from 'quick-temp';

patchInPlace();

const tmp = relative(process.cwd(), makeOrRemake({}, 'fixtures'));

const application = `import Foo from "../foo";
                     import SomeLeaf from "./leaf";
                     export default class Route {}`;
const bizz = `import Bar from './bar';
              import Foo from './foo';
              export default class Bizz { constructor() {} }`;

let fsGraph;
let fileEntries;

test.before(_ => {
  mockfs({
    'app/dummy': {
      'index.js': 'import Foo from "./foo";\nlet foo = new Foo();',
      'foo.js': 'import Bar from "./bar";\nexport default class Foo extends Bar {}',
      'bizz.js': bizz,
      'bar.js': 'export default class Bar {}'
    },
    'app/dummy/routes': {
      'application.js': application,
      'leaf.js': 'export default class Leaf {}'
    }
  });

  fileEntries = entries('app', { directories: false });

  fsGraph = new FSGraph({
    srcDir: resolve('app'),
    namespace: 'dummy'
  });


});

test('Initial addition', t => {
  let patch = fsGraph.calculatePatch(fileEntries).sort();
  t.deepEqual(patch, [
    'dummy/bar.js',
    'dummy/bizz.js',
    'dummy/foo.js',
    'dummy/index.js',
    'dummy/routes/application.js',
    'dummy/routes/leaf.js'
  ]);
});


