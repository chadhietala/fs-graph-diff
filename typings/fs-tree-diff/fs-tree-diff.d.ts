/// <reference path="../walk-sync/walk-sync.d.ts" />

declare module "fs-tree-diff" {
  import { Entry } from 'walk-sync';

  interface Options {
    entries?: Array<Object>
  }

  class FSTreeDiff {
    constructor(options?: Options);
    static fromEntries(entries: Entry[]): any;
    calculatePatch(tree: FSTreeDiff): Array<Array<string>>;
  }

  export = FSTreeDiff;

}
