import { Entry } from 'walk-sync';

export class MockEntry implements Entry {
  public relativePath: string;
  public mode: string;
  public size: number;
  public mtime: number;
  constructor(options) {
    this.relativePath = options.relativePath;
    this.mode = options.mode;
    this.size = options.size;
    this.mtime = options.mtime;
  }

  isDirectory() {
    return false;
  }
}

export const entry = (options) => {
  return new MockEntry({
    relativePath: options.relativePath || 0,
    mode: options.mode || 0,
    size: options.size || 0,
    mtime: options.mtime || 0
  })
}
