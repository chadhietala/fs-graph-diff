declare module "graphlib" {

  interface Options {
    directed?: boolean;
    compound?: boolean;
    multigraph?: boolean;
  }

  interface Edge {
    v: string;
    w: string
  }

  export class Graph {
    constructor(options?: Options);
    setNode(node: string, label?: any): void;
    setEdge(sourceNode: string, targetNode: string, label?: any): void;
    removeEdge(sourceNode: string, targetNode: string): void;
    node(node: string): any;
    outEdges(node: string): Edge[];
    inEdges(node: string): Edge[];
    removeNode(node: string): void;
    sources(): string[];
  }

}
