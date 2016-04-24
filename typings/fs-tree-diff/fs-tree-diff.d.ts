declare module "fs-tree-diff" {

  interface Options {
    entries?: Array<Object>
  }

  interface Enties {
    [0]: string;
    [1]: string;
    [2]: Object;
  }

  class FSTreeDiff {
    constructor(options?: Options);
    static fromEntries(entries: Enties): any;
    calculatePatch(tree: FSTreeDiff): Array<Array<string>>;
  }

  export = FSTreeDiff;

}
