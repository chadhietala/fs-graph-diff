import { transform } from 'babel-core';
import { readFileSync } from 'fs';
import { ImportDeclaration } from 'babel-types'
import traverse from 'babel-traverse';
import { difference, normalizeRelativePath } from './utils';
import { moduleResolve } from 'amd-name-resolver';
import { extname } from 'path';

export interface ModuleOptions {
  root: string;
  namespace: string;
  relativePath: string;
  inputPath: string;
  outputPath: string;
}

export default class Module {
  public imports: string[];
  public id: string;
  namespace: string;
  ast: any;
  inputPath: string;
  outputPath: string;
  relativePath: string;

  constructor(options: ModuleOptions) {
    let relativePath = options.relativePath;
    this.namespace = options.namespace;

    let ext = extname(relativePath);
    this.id = normalizeRelativePath(options.namespace, relativePath);
    this.inputPath = options.inputPath;
    this.outputPath = options.outputPath;
    this.relativePath = relativePath;
    let ast = this.ast = this.parse(options.inputPath);
    this.imports = this.captureImports(ast);
  }

  parse(inputPath: string): Object {
    return transform(readFileSync(inputPath, 'utf8')).ast;
  }

  captureImports(ast) {
    let imports = [];
    traverse(ast, {
      enter(path) {
        if (path.isImportDeclaration()) {
          imports.push(path.node);
        }
      }
    });

    return imports.map((imp) => moduleResolve(imp.source.value, this.id));
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
