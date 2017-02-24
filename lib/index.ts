s/**
 * Normalize slashes
 */

import { Graph } from 'graph-lib';

function normalize(str) {
  str = path.normalize(str);
  str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  return str.split(/[\\\/]+/);
}


class FSGraph {
  namespaces: Object;
  constructor(private roots) {
    this.namespaces = {};
    this.graph = new Graph();
  }

  private contains(filePath, segment) {
    var prefix = '(^|\\/)';
    if (segment.indexOf('./') === 0 || segment.charAt(0) === '/') {
      prefix = '^';
    }

    var re = new RegExp(prefix + normalize(segment).join('\\/') + '($|\\/)');
    filePath = normalize(filePath).join('/');
    return re.test(filePath);
  }

  create(changes, moduleInfo) {
    changes.forEach(([, relativePath]) => {
      let ns = this.ns(relativePath);
      let rootIndex = this.roots.indexOf(ns);
      if (rootIndex > -1) {
        let root = this.roots[rootIndex];
        this.graph.setNode(relativePath, new Module(relativePath, moduleInfo, ns));
      }


      // if (this.namespaces[ns]) {
      //   this.namespaces[ns][relativePath] = new Module(moduleInfo);
      // } else {
      //   this.namespaces[ns] = {
      //     [relativePath]: new Module(moduleInfo);
      //   }
      // }
    });
  }

  private ns(relativePath) {
    let [ ns ] = relativePath.split('/');
    return ns;
  }

  private remove(relativePath) {
    let ns = this.ns(relativePath);
    this.namespaces[ns][relativePath].prune();
  }

  update([change], moduleInfo) {
    let [op, relativePath] = change;

    switch (op) {
      case 'remove':

      case 'add':

      case 'update':
    }

    if (op === 'remove') {
      this.remove(relativePath);
    }
  }

  calculate() {

  }
}

// graph.add([['create', 'my-app/foo/bar']], moduleInfo);
// graph.update(['update', 'my-app/bizz'], moduleInfo);
// graph.calculate();

class Module {
  private imports = [];
  private deps = [];
  constructor() {}

  get isRetained() {
    return this.deps.length > 0;
  }

  addDependencies(module: Module) {
    this.deps.push(module);
  }
}


new FSGraph()