import FSTree = require('fs-tree-diff');
import { Graph } from 'graphlib';
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
    constructor(options: FSGraphOptions);
    private verifyGraph(relativePath, inputPath);
    private addToGraph(relativePath, inputPath, outputPath);
    private removeFromGraph(relativePath);
    private computeGraph(operation, relativePath);
    printGraph(): void;
    compute(entries: any): any[];
}
