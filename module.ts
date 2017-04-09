export default class Module {
  private roots: string[];
  constructor(
    private root: string,
    private name: string,
    private parent?: Module
  ) {
    this.roots = [];
    if (!parent) {
      this.parent = this;
    }
  }

  isRooted() {
    return this.roots.length > 0;
  }

  unrooted(name) {
    let index = this.roots.indexOf(name);
    if (index > -1) {
      this.roots.splice(1, index);
    }
  }

  rooted(name) {
    if (!(this.roots.indexOf(name) > -1)) {
      this.roots.push(name);
    }
  }

  chain(root, name) {
    let mod = new Module(root, name, this);
    if (this.parent !== this) {
      mod.rooted(this.parent.root);
    }

    return mod;
  }
}