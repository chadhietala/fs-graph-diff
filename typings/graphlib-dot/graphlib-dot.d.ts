/// <reference path="../graphlib/graphlib.d.ts" />

declare module "graphlib-dot" {
  import { Graph } from 'graphlib';
  export function write(graph: Graph): any
}
