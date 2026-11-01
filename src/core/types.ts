export type V3 = [number, number, number];
export type Aspect = 'red' | 'yellow' | 'double-yellow' | 'green';
export type Direction = 1 | -1;
export interface Station {
  id: string; name: string; s: number; position: V3; length: number;
  platformCount: number; style?: string; [key: string]: unknown;
}
export interface Structure {
  id: string; type: string; position: V3; s?: number; startS?: number; endS?: number;
  length?: number; width?: number; angle?: number; height?: number; points?: V3[];
  confidence?: string; source?: string; [key: string]: unknown;
}
export interface Feature {
  id: string; points?: V3[]; footprint?: number[][]; position?: V3;
  height?: number; width?: number; kind?: string; type?: string; [key: string]: unknown;
}
export interface WorldTile {
  id: string; bounds?: number[]; roads: Feature[]; buildings: Feature[];
  tracks?: Feature[]; land?: Feature[]; platforms?: Feature[]; structures?: Structure[];
}
export interface TerrainMeta {
  url: string; width: number; height: number; origin: [number, number];
  step: number; offset: number; scale: number; nodata: number; [key: string]: unknown;
}
export interface RouteData {
  version?: string | number; origin: number[]; points: V3[]; stations: Station[];
  tracks: Feature[]; structures: Structure[]; signals?: unknown[]; crossings?: unknown[];
  tiles: {id: string; url: string; bounds: number[]}[]; terrain: TerrainMeta;
  [key: string]: unknown;
}
