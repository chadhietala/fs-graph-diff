"use strict";
const babel_core_1 = require('babel-core');
const fs_1 = require('fs');
const babel_traverse_1 = require('babel-traverse');
const utils_1 = require('./utils');
const amd_name_resolver_1 = require('amd-name-resolver');
const path_1 = require('path');
class Module {
    constructor(options) {
        let relativePath = options.relativePath;
        this.namespace = options.namespace;
        let ext = path_1.extname(relativePath);
        this.id = utils_1.normalizeRelativePath(options.namespace, relativePath);
        this.inputPath = options.inputPath;
        this.outputPath = options.outputPath;
        this.relativePath = relativePath;
        let ast = this.ast = this.parse(options.inputPath);
        this.imports = this.captureImports(ast);
    }
    parse(inputPath) {
        return babel_core_1.transform(fs_1.readFileSync(inputPath, 'utf8')).ast;
    }
    captureImports(ast) {
        let imports = [];
        babel_traverse_1.default(ast, {
            enter(path) {
                if (path.isImportDeclaration()) {
                    imports.push(path.node);
                }
            }
        });
        return imports.map((imp) => amd_name_resolver_1.moduleResolve(imp.source.value, this.id));
    }
    calculateImports() {
        let ast = this.ast = this.parse(this.inputPath);
        let newImports = this.captureImports(ast);
        let removals = utils_1.difference(this.imports, newImports);
        let additions = utils_1.difference(newImports, this.imports);
        let removalOps = removals.map(removal => ['disconnect', removal]);
        let additionOps = additions.map(addition => ['connect', addition]);
        this.imports = newImports;
        return [...removalOps, ...additionOps];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Module;
//# sourceMappingURL=module.js.map