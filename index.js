class FSGraph {
  constructor() {
    this.roots = [...arguments];
    this.graph = new Graph();
    this.dependencyStack = [];
    this.moduleInfos = null;
  }

  _isRootEntry(potentialRoot) {
    return this.roots.includes(potentialRoot);
  }

  create(patches, moduleInfos) {
    this.moduleInfos = moduleInfos;
    patches.forEach(([, relativePath]) => {
      let ns = this._ns(relativePath);
      let moduleInfo = moduleInfos[ns];

      for (let i = 0; i < moduleInfo.files.length; i++) {
        let fileName = moduleInfo.files[i].name;
        if (fileName === relativePath) {
          this._appendNode(ns, relativePath, moduleInfo.files[i]);
          break;
        }
      }
    });

    this.prune();
  }

  update(patches, moduleInfos) {
    let [op, relativePath] = patches[0];
    if (JSON.stringify(this.moduleInfos) !== JSON.stringify(moduleInfos)) {
      this.moduleInfos = moduleInfos;
      switch (op) {
        case 'update':
          this._update(patches, moduleInfos);
          break;
        case 'delete':
          this._remove(patches, moduleInfos);
          break;
        case 'create':
          this.create(patches, moduleInfos);
          break;
      }
    }
  }

  _remove(patches, moduleInfos) {
    patches.forEach(([, relativePath]) => {
      this._removeNodes(relativePath);
    });
  }

  _removeNodes(relativePath) {
    let outEdges = this.graph.outEdges(relativePath);
    outEdges.forEach(({ v: _vertix, w: _node }) => {
      this.graph.removeEdge(_vertix, _node);
      let module = this.graph.node(_node);
      let inEdges = this.graph.inEdges(_node) || [];

      if (inEdges.length === 0) {
        let outEdges = this.graph.outEdges(_node);
        this._removeNodes(_node);
        this.graph.removeNode(_node);
      }
    });

    this.graph.removeNode(relativePath);
  }

  _update(patches, moduleInfos) {
    patches.forEach(([, relativePath]) => {
      let ns = this._ns(relativePath);
      let moduleInfo = moduleInfos[ns];
      for (let i = 0; i < moduleInfo.files.length; i++) {
        let fileName = moduleInfo.files[i].name;
        if (fileName === relativePath) {
          this._detachUnreachable(ns, relativePath, moduleInfo.files[i]);
          break;
        }
      }
    });
  }

  _detachUnreachable(ns, relativePath, moduleInfo) {
    let outEdges = this.graph.outEdges(relativePath);
    if (moduleInfo.imports.length === 0) {
      outEdges.forEach((edge) => {
        let { w, v } = edge;
        this.graph.removeEdge(v, w);
      });
    } else {
      moduleInfo.imports.forEach(({ source }) => source);
      outEdges.forEach(({ w, v }) => {
        if (!moduleInfo.imports.includes(w)) {
          this.graph.removeEdge(v, w);
        }
      });

      moduleInfo.imports.forEach(({ source }) => {
        if (!this.graph.node(source)) {
          this._appendNode(ns, relativePath, moduleInfo);
        }
      });
    }
  }

  _getRoots() {
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

  prune() {
    let pruned = {};
    let roots = this._getRoots();
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

  _appendNode(root, relativePath, moduleInfo) {
    let module = this.graph.node(relativePath);

    if (!module) {
      module = new Module(root, relativePath, null);
      this.graph.setNode(relativePath, module);
    }

    if (this._isRootEntry(root)) {
      module.rooted(relativePath);
    }

    moduleInfo.imports.forEach((dependency) => {
      let dependencyName = `${dependency.source}.js`;
      let dependencyModule = this.graph.node(dependencyName);
      let ns = this._ns(dependencyName);

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
        this._appendNode(dependencyModule.root, dependencyName, depsOfDep);
      }

    });
  }

  _ns(relativePath) {
    let [ns] = relativePath.split('/');
    return ns;
  }

  serialize() {
    return write(this.graph)
  }
}

class Module {
  constructor(root, name, parent) {
    this.root = root;
    this.name = name;
    this._parent = parent;
    this._roots = [];
  }

  isRooted() {
    return this._roots.length > 0;
  }

  unrooted(name) {
    let index = this._roots.indexOf(name);
    if (index > -1) {
      this._roots.splice(1, index);
    }
  }

  rooted(name) {
    if (!this._roots.includes(name)) {
      this._roots.push(name);
    }
  }

  chain(root, name) {
    let mod = new Module(root, name, this);
    if (this._parent !== null) {
      mod.rooted(this._parent.root);
    }

    return mod;
  }
}