import Dexie, { type EntityTable } from "dexie";
import type { Format } from "@/types";

export interface Comparison {
  id: string;
  title: string;
  leftContent: string;
  rightContent: string;
  leftFormat: Format;
  rightFormat: Format;
  leftFileName: string;
  rightFileName: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

class DiffLabDB extends Dexie {
  comparisons!: EntityTable<Comparison, "id">;

  constructor() {
    super("difflab");
    this.version(1).stores({
      comparisons: "id, title, leftFormat, rightFormat, createdAt, updatedAt, *tags",
    });
  }
}

export const db = new DiffLabDB();

export async function saveComparison(data: Omit<Comparison, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.comparisons.add({
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateComparison(id: string, data: Partial<Omit<Comparison, "id" | "createdAt">>): Promise<void> {
  await db.comparisons.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteComparison(id: string): Promise<void> {
  await db.comparisons.delete(id);
}

export async function deleteAllComparisons(): Promise<void> {
  await db.comparisons.clear();
}

export async function getComparison(id: string): Promise<Comparison | undefined> {
  return db.comparisons.get(id);
}

export async function listComparisons(
  options?: {
    search?: string;
    format?: Format;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
  },
): Promise<Comparison[]> {
  let collection = db.comparisons.orderBy(options?.sortBy ?? "updatedAt");

  if (options?.order === "asc") {
    // default is desc for dates
  } else {
    collection = collection.reverse();
  }

  let results = await collection.toArray();

  if (options?.format) {
    results = results.filter(
      (c) => c.leftFormat === options.format || c.rightFormat === options.format,
    );
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.leftFileName.toLowerCase().includes(q) ||
        c.rightFileName.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 50;
  return results.slice(offset, offset + limit);
}

export async function getStorageEstimate(): Promise<{
  used: number;
  quota: number;
  percentage: number;
} | null> {
  if (!navigator.storage?.estimate) return null;
  const est = await navigator.storage.estimate();
  const used = est.usage ?? 0;
  const quota = est.quota ?? 0;
  return {
    used,
    quota,
    percentage: quota > 0 ? (used / quota) * 100 : 0,
  };
}

export async function exportHistory(): Promise<string> {
  const all = await db.comparisons.toArray();
  return JSON.stringify(all, null, 2);
}

export async function importHistory(json: string): Promise<number> {
  const data = JSON.parse(json) as Comparison[];
  await db.comparisons.bulkPut(
    data.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
  );
  return data.length;
}
