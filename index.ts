import FSTree = require('fs-tree-diff');
import { Graph } from 'graphlib';
import {
  default as Module,
  ModuleOptions
} from './module';
import { writeFileSync } from 'fs';
import { write as writeGraph } from 'graphlib-dot';
import { normalizeRelativePath } from './utils';
import { normalize } from 'path';
import { extname } from 'path';
import { moduleResolve } from 'amd-name-resolver'

export interface FSGraphOptions {
  srcDir: string;
  destDir: string;
  namespace: string;
}

export default class FSGraph {
  currentTree: FSTree;
  graph: Graph;
  srcDir: string;
  destDir: string;
  printed: number;
  namespace: string;
  constructor(options: FSGraphOptions) {
    this.srcDir = options.srcDir;
    this.destDir = options.destDir;
    this.currentTree = new FSTree();
    this.graph = new Graph();
    this.printed = 0;
    this.namespace = options.namespace;
  }

  private verifyGraph(relativePath: string, inputPath: string) {
    let normalizedPath = this.pathByNamespace(relativePath);

    let mod = this.graph.node(normalizedPath.id);
    let patchImports = mod.calculateImports();
    return patchImports.map(patch => {
      let operation = patch[0];
      let importPath = patch[1];
      if (this.graph.node(importPath)) {
        if (operation === 'connect') {
          this.graph.setEdge(relativePath, importPath);

          let inEdges = this.graph.outEdges(importPath);
          let inEdgePaths = inEdges.map(edge => this.graph.node(edge.v).inputPath);

          return [inputPath, ...inEdgePaths];
        } else if (operation === 'disconnect') {
          this.graph.removeEdge(normalizedPath.id, importPath);

          let inEdges = this.graph.inEdges(importPath);

          return null;
        }
      }
      // TODO we need to handle things coming out of node_modules
    }).filter(Boolean);
  }

  private pathByNamespace(relativePath) {
    let parts = relativePath.split('/');
    let namespace = parts[0];
    let id = relativePath.replace(extname(relativePath), '');
    let path = relativePath;

    return {
      namespace,
      id,
      path
    }
  }

  private addToGraph(relativePath, inputPath, outputPath) {
    let normalizedPath = this.pathByNamespace(relativePath);

    if (this.graph.node(normalizedPath.id)) return;

    let mod = new Module({
      id: normalizedPath.id,
      namespace: normalizedPath.namespace,
      relativePath,
      inputPath,
      outputPath
    });

    this.graph.setNode(mod.id, mod);

    mod.imports.forEach(dep => {
      this.graph.setEdge(mod.id, dep);
      let relativePath = moduleResolve(dep, mod.id);
      let normalizedPath = this.pathByNamespace(relativePath);

      if (normalizedPath.namespace === this.namespace) {
        let inputPath = `${this.srcDir}/${relativePath}.ts`;
        let outputPath = `${this.destDir}/${relativePath}.ts`;
        this.addToGraph(relativePath, inputPath, outputPath);
      } else {
        console.log('EXTERNAL: ' + normalizedPath.path);
      }
    });
  }

  private removeFromGraph(relativePath) {
    let normalizedPath = this.pathByNamespace(relativePath);
    let id = normalizedPath.id;

    let inEdges = this.graph.inEdges(id) || []
    let inVertices = inEdges.map(edge => edge.v);
    let outEdges = this.graph.outEdges(id) || [];
    let outVertices = outEdges.map(edge => edge.w) || [];



    if (inVertices.length === 0) {
      this.graph.removeNode(id);
      outVertices.forEach(node => {
        if (this.graph.node(node)) {
                  this.removeFromGraph(this.graph.node(node).relativePath);

        }
      });
    }
  }

  private computeGraph(operation: string, relativePath: string): void {
    let outputPath = `${this.destDir}/${relativePath}`;
    let inputPath = `${this.srcDir}/${relativePath}`;

    switch (operation) {
      case 'add':
        this.addToGraph(relativePath, inputPath, outputPath);
        break;
      case 'verify':
        this.verifyGraph(relativePath, inputPath);
        break;
      case 'remove':
        this.removeFromGraph(relativePath);
        break;
    }
  }

  printGraph() {
    writeFileSync(`./graph.${this.printed}.dot`, writeGraph(this.graph));
    this.printed++;
  }

  calculatePatch(entries) {
    let nextTree = FSTree.fromEntries(entries);
    let currentTree = this.currentTree;
    this.currentTree = nextTree;
    var patches = currentTree.calculatePatch(nextTree).map(patch => [patch[0], patch[1]]);

    patches.forEach(patch => {
      let operation = patch[0];
      let relativePath = patch[1];
      switch(operation) {
        case 'change':
          this.computeGraph('verify', relativePath);
          break;
        case 'create':
          this.computeGraph('add', relativePath);
          break;
        case 'unlink':
          this.computeGraph('remove', relativePath);
          break;
      }
    });

    return this.graph.nodes().map(node => this.graph.node(node).relativePath);

  }
}
