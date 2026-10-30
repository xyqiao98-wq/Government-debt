import type { CityMetadata, CityRecord } from '@/types/city';

let metadataPromise: Promise<CityMetadata> | null = null;
const yearCache = new Map<number, Promise<CityRecord[]>>();

function publicUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(publicUrl(path));
  if (!response.ok) throw new Error(`数据加载失败：${response.status} ${path}`);
  return response.json() as Promise<T>;
}

export function loadCityMetadata() {
  metadataPromise ??= fetchJson<CityMetadata>('data/metadata.json');
  return metadataPromise;
}

export function loadCityYear(year: number) {
  if (!yearCache.has(year)) {
    yearCache.set(year, fetchJson<CityRecord[]>(`data/cities/${year}.json`));
  }
  return yearCache.get(year)!;
}

export async function loadCityHistory(regionKeys: string[], years: number[]) {
  const keys = new Set(regionKeys);
  const datasets = await Promise.all(years.map(loadCityYear));
  return datasets.flat().filter((record) => keys.has(record.regionKey));
}
