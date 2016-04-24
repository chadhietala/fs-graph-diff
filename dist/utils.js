"use strict";
const fast_ordered_set_1 = require('fast-ordered-set');
const path_1 = require('path');
const amd_name_resolver_1 = require('amd-name-resolver');
function difference(a1, a2) {
    var a2Set = new fast_ordered_set_1.default(a2);
    return a1.filter(function (x) { return !a2Set.has(x); });
}
exports.difference = difference;
function normalizeRelativePath(namespace, relativePath) {
    let ext = path_1.extname(relativePath);
    return amd_name_resolver_1.moduleResolve(`${namespace}/${relativePath.replace(ext, '')}`, namespace);
}
exports.normalizeRelativePath = normalizeRelativePath;
//# sourceMappingURL=utils.js.map