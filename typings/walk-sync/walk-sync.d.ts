declare module "walk-sync" {
  export interface Entry {
    relativePath: string;
    basePath?: string;
    mode: string;
    mtime: number;
    size: number;
    isDirectory(): boolean;
  }
  export function entries(dir: string, options?: any): Entry[]
}
