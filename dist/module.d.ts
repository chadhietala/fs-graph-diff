export interface ModuleOptions {
    root: string;
    namespace: string;
    relativePath: string;
    inputPath: string;
    outputPath: string;
}
export default class Module {
    imports: string[];
    id: string;
    namespace: string;
    ast: any;
    inputPath: string;
    outputPath: string;
    relativePath: string;
    constructor(options: ModuleOptions);
    parse(inputPath: string): Object;
    captureImports(ast: any): string[];
    calculateImports(): any[][];
}
