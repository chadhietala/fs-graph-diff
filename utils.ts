import Set = require('fast-ordered-set');
import { extname } from 'path';
import { moduleResolve } from 'amd-name-resolver';

export function difference(a1: any[], a2: any[]) {
  var a2Set = new Set(a2);
  return a1.filter(function(x) { return !a2Set.has(x); });
}

export function normalizeRelativePath(namespace, relativePath) {
    let ext = extname(relativePath);
    return moduleResolve(`${namespace}/${relativePath.replace(ext, '')}`, namespace);
}
