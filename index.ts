import FSTree = require('fs-tree-diff');
import { Graph } from 'graphlib';
import {
  default as Module,
  ModuleOptions
} from './module';
import { writeFileSync } from 'fs';
import { write as writeGraph } from 'graphlib-dot';
import { normalizeRelativePath } from './utils';

export interface FSGraphOptions {
  root: string;
  namespace: string;
  srcDir: string;
  destDir: string;
}

export default class FSGraph {
  currentTree: FSTree;
  graph: Graph;
  srcDir: string;
  destDir: string;
  printed: number;
  root: string;
  namespace: string;
  constructor(options: FSGraphOptions) {
    this.srcDir = options.srcDir;
    this.destDir = options.destDir;
    this.root = options.root;
    this.namespace = options.namespace;
    this.currentTree = new FSTree();
    this.graph = new Graph();
    this.printed = 0;
  }

  private verifyGraph(relativePath: string, inputPath: string) {
    let mod = this.graph.node(relativePath);
    let patchImports = mod.calculateImports();
    return patchImports.map(patch => {
      let operation = patch[0];
      let importPath = patch[1];
      if (this.graph.node(importPath)) {
        if (operation === 'connect') {
          this.graph.setEdge(relativePath, importPath);

          let inEdges = this.graph.outEdges(importPath);
          let inEdgePaths = inEdges.map(edge => this.graph.node(edge.v).inputPath)

          return [inputPath, ...inEdgePaths];
        } else if (operation === 'disconnect') {
          this.graph.removeEdge(relativePath, importPath);

          let inEdges = this.graph.inEdges(importPath);

          return null;
        }
      }
      // TODO we need to handle things coming out of node_modules
    }).filter(Boolean);
  }

  private addToGraph(relativePath, inputPath, outputPath) {
    let mod = new Module({
      root: this.root,
      namespace: this.namespace,
      inputPath,
      outputPath,
      relativePath
    });

    this.graph.setNode(mod.id, mod);
    mod.imports.forEach(dep => {
      this.graph.setEdge(mod.id, dep)
    });
    return [inputPath];
  }

  private removeFromGraph(relativePath) {
    let normalizedPath = normalizeRelativePath(this.namespace, relativePath);

    let inEdges = this.graph.inEdges(normalizedPath) || []
    let inVertices = inEdges.map(edge => edge.v);
    let outEdges = this.graph.outEdges(normalizedPath) || [];
    let outVertices = outEdges.map(edge => edge.w);

    /**
     * File has been removed from input
     *
     * look if anything was pointing at it, if so
     *    throw Error as the node was retained in the graph
     *
     * if nothing is pointing at it look at it's outEdges to
     * see what it was point at. If that outEdge has a single
     * inward edge, recursively check node for removal
     *
     *
     */

    if (inVertices.length === 0) {
      this.graph.removeNode(normalizedPath);
      outVertices.forEach(node => {
        console.log(node, normalizedPath);
        this.removeFromGraph(this.graph.node(node).relativePath);
      });
    }

    // if (inEdges.length > 0) {
    //   console.log(inEdges, relativePath);
    // }

    // if (inVertices.length > 0) {
    //   inVertices.forEach(node => {
    //     this.removeFromGraph(this.graph.node(node).relativePath);
    //   });
    // }

    // if (inVertices.length === 0) {
    //   // this.graph.removeNode(normalizedPath);
    // }



    return [];

  }

  private computeGraph(operation: string, relativePath: string): string[] {
    let outputPath = `${this.destDir}/${relativePath}`;
    let inputPath = `${this.srcDir}/${relativePath}`;

    switch (operation) {
      case 'add':
        return this.addToGraph(relativePath, inputPath, outputPath);
      case 'verify':
        return this.verifyGraph(relativePath, inputPath);
      case 'remove':
        return this.removeFromGraph(relativePath);
    }
  }

  printGraph() {
    writeFileSync(`./graph.${this.printed}.dot`, writeGraph(this.graph));
    this.printed++;
  }

  compute(entries) {
    let nextTree = FSTree.fromEntries(entries);
    let currentTree = this.currentTree;
    this.currentTree = nextTree;
    var patches = currentTree.calculatePatch(nextTree).map(patch => [patch[0], patch[1]]);

    let graphPatches = [];
    const graphPatch = (patches) => graphPatches = graphPatches.concat(patches);

    patches.forEach(patch => {
      let operation = patch[0];
      let relativePath = patch[1];
      switch(operation) {
        case 'change':
          graphPatch(this.computeGraph('verify', relativePath));
          break;
        case 'create':
          graphPatch(this.computeGraph('add', relativePath));
          break;
        case 'unlink':
          graphPatch(this.computeGraph('remove', relativePath));
          break;
      }
    });

    return graphPatches;

  }
}
