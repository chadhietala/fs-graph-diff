import { Graph, alg } from 'graphlib';
import Module from './module';
import stringify from 'stable-stringify';

const { postOrder } = alg;

export interface FSGraphOptions {
  srcDir: string;
  namespace: string;
}

export default class FSGraph {
  private roots: string[];
  private moduleInfos: Object;
  constructor(...roots: string[]) {
    this.roots = roots;
    this.graph = new Graph();
  }

  calculateGraph(patches, moduleInfos) {
    let [op, relativePath] = patches[0];
    if (stringify(this.moduleInfos) !== stringify(moduleInfos)) {
      this.moduleInfos = moduleInfos;
      switch (op) {
        case 'update':
          this.update(patches, moduleInfos);
          break;
        case 'delete':
          this.remove(patches, moduleInfos);
          break;
        case 'create':
          this.create(patches, moduleInfos);
          break;
      }
    }

    this.prune();

    return this.construct();
  }

  construct() {
    return this.graph.nodes().map((node) => this.graph.node(node).name);
  }

  private create(patches, moduleInfos) {
    this.moduleInfos = moduleInfos;
    patches.forEach(([, relativePath]) => {
      let ns = this.ns(relativePath);
      let moduleInfo = moduleInfos[ns];

      for (let i = 0; i < moduleInfo.files.length; i++) {
        let fileName = moduleInfo.files[i].name;
        if (fileName === relativePath) {
          this.appendNode(ns, relativePath, moduleInfo.files[i]);
          break;
        }
      }
    });
  }

  private remove(patches, moduleInfos) {
    patches.forEach(([, relativePath]) => {
      this.removeNodes(relativePath);
    });
  }

  private removeNodes(relativePath) {
    let outEdges = this.graph.outEdges(relativePath);
    outEdges.forEach(({ v: _vertix, w: _node }) => {
      this.graph.removeEdge(_vertix, _node);
      let module = this.graph.node(_node);
      let inEdges = this.graph.inEdges(_node) || [];

      if (inEdges.length === 0) {
        let outEdges = this.graph.outEdges(_node);
        this.removeNodes(_node);
        this.graph.removeNode(_node);
      }
    });

    this.graph.removeNode(relativePath);
  }

  private update(patches, moduleInfos) {
    patches.forEach(([, relativePath]) => {
      let ns = this.ns(relativePath);
      let moduleInfo = moduleInfos[ns];
      for (let i = 0; i < moduleInfo.files.length; i++) {
        let fileName = moduleInfo.files[i].name;
        if (fileName === relativePath) {
          this.verifyNode(ns, relativePath, moduleInfo.files[i]);
          break;
        }
      }
    });
  }

  private verifyNode(ns, relativePath, moduleInfo) {
    let outEdges = this.graph.outEdges(relativePath);
    if (moduleInfo.imports.length === 0) {
      outEdges.forEach((edge) => {
        let { w } = edge;
        this.graph.removeNode(w);
      });
    } else {
      moduleInfo.imports.forEach(({ source }) => source);
      outEdges.forEach(({ w: outEdge }) => {
        if (!moduleInfo.imports.includes(outEdge)) {
          this.graph.removeNode(outEdge);
        }
      });

      moduleInfo.imports.forEach(({ source }) => {
        if (!this.graph.node(source)) {
          this.appendNode(ns, relativePath, moduleInfo);
        }
      });
    }
  }

  private appendNode(root, relativePath, moduleInfo) {
    let module = this.graph.node(relativePath);

    if (!module) {
      module = new Module(root, relativePath);
      this.graph.setNode(relativePath, module);
    }

    if (this._isRootEntry(root)) {
      module.rooted(relativePath);
    }

    moduleInfo.imports.forEach((dependency) => {
      let dependencyName = `${dependency.source}.js`;
      let dependencyModule = this.graph.node(dependencyName);
      let ns = this.ns(dependencyName);

      if (!dependencyModule) {
        dependencyModule = module.chain(ns, dependencyName);
      }

      // transitively mark dependencies as rooted
      if (module.isRooted()) {
        dependencyModule.rooted(relativePath);
      }

      this.graph.setNode(dependencyName, dependencyModule);
      this.graph.setEdge(relativePath, dependencyName);

      let [depsOfDep] = this.moduleInfos[ns].files.filter((file) => file.name === dependencyName);

      if (depsOfDep.imports.length > 0) {
        this.appendNode(dependencyModule.root, dependencyName, depsOfDep);
      }
    });
  }

  private getRoots() {
    let nodes = this.graph.nodes();
    let rooted = {};

    nodes.forEach((name) => {
      let { root } =  this.graph.node(name);
      if (this._isRootEntry(root)) {
        if (rooted[root] && !rooted[root].includes(name)) {
          rooted[root].push(name);
        } else if (!rooted[root]) {
          rooted[root] = [name];
        }
      }
    });

    return rooted;
  }

  private prune() {
    let pruned = {};
    let roots = this.getRoots();
    let rootNames = Object.keys(roots);

    rootNames.forEach((root) => {
      let _roots = roots[root];
      _roots.forEach((name) => {
        let connected = postOrder(this.graph, name);
        if (pruned[root]) {
          pruned[root] = pruned[root].concat(connected.filter((node) => {
            return !pruned[root].includes(node);
          }))
        } else {
          pruned[root] = connected;
        }
      })
    });

    let nodes = this.graph.nodes();

    Object.keys(pruned).forEach((root) => {
      nodes.forEach((node) => {
        let module = this.graph.node(node);

        if (!module || !module.isRooted()) {
          this.graph.removeNode(node);
        }
      });
    });
  }

  private ns(relativePath) {
    let [ns] = relativePath.split('/');
    return ns;
  }

  private _isRootEntry(potentialRoot) {
    return this.roots.indexOf(potentialRoot) > -1;
  }
}
