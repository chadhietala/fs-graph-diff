import { transform } from 'babel-core';
import { readFileSync } from 'fs';
import { ImportDeclaration } from 'babel-types'
import traverse from 'babel-traverse';
import { difference } from './utils';
import { moduleResolve } from 'amd-name-resolver';

export interface ModuleOptions {
  namespace: string;
  id: string;
  inputPath: string;
  relativePath: string;
}

export default class Module {
  public imports: string[];
  public id: string;
  public relativePath: string;
  ast: any;
  inputPath: string;
  outputPath: string;

  constructor(options: ModuleOptions) {
    this.id = options.id;
    this.inputPath = options.inputPath;
    let ast = this.ast = this.parse(options.inputPath);
    this.imports = this.captureImports(ast);
    this.relativePath = options.relativePath;
  }

  parse(inputPath: string): Object {
    return transform(readFileSync(inputPath, 'utf8')).ast;
  }

  captureImports(ast) {
    let imports = [];
    let exports = [];
    let reexports = [];
    let exportAllSources = [];

    traverse(ast, {
      enter(path) {
        if (path.isImportDeclaration()) {
          imports.push(path.node);
        }
      }
    });

    return imports.map((imp) => {
      return moduleResolve(imp.source.value, this.id);
    });
  }

  public calculateImports() {
    let ast = this.ast = this.parse(this.inputPath);
    let newImports = this.captureImports(ast);
    let removals = difference(this.imports, newImports);
    let additions = difference(newImports, this.imports);
    let removalOps = removals.map(removal => ['disconnect', removal]);
    let additionOps = additions.map(addition => ['connect', addition]);
    this.imports = newImports;
    return [...removalOps, ...additionOps];
  }
}
