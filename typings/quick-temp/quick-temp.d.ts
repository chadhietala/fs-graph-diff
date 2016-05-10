declare module "quick-temp" {
  export function makeOrRemake(ctx: any, name: string): string;
  export function makeOrReuse(ctx: any, name: string): string;
  export function remove(ctx: any, name: string): void;
}
