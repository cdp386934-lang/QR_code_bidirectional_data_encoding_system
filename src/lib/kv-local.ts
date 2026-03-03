// 本地开发用的内存存储实现
// 模拟 Vercel KV 的行为，用于本地测试

interface LocalStore {
  [key: string]: string | number;
}

// 内存存储
const store: LocalStore = {};

// 模拟 Sorted Set (用于 qr:list)
const sortedSets: { [key: string]: Array<{ score: number; member: string }> } = {};

/**
 * 模拟 KV incr 操作
 */
export async function incr(key: string): Promise<number> {
  const current = (store[key] as number) || 0;
  const newValue = current + 1;
  store[key] = newValue;
  return newValue;
}

/**
 * 模拟 KV set 操作
 */
export async function set(key: string, value: string): Promise<void> {
  store[key] = value;
}

/**
 * 模拟 KV get 操作
 */
export async function get<T = string>(key: string): Promise<T | null> {
  const value = store[key];
  if (value === undefined) return null;
  return value as T;
}

/**
 * 模拟 KV zadd 操作 (添加到 Sorted Set)
 */
export async function zadd(
  key: string,
  item: { score: number; member: string }
): Promise<void> {
  if (!sortedSets[key]) {
    sortedSets[key] = [];
  }

  // 移除已存在的成员
  sortedSets[key] = sortedSets[key].filter((i) => i.member !== item.member);

  // 添加新成员
  sortedSets[key].push(item);

  // 按分数排序
  sortedSets[key].sort((a, b) => a.score - b.score);
}

/**
 * 模拟 KV zrange 操作 (从 Sorted Set 获取范围)
 */
export async function zrange(
  key: string,
  start: number,
  stop: number,
  options?: { rev?: boolean }
): Promise<string[]> {
  const set = sortedSets[key] || [];

  let result = [...set];

  // 如果是倒序
  if (options?.rev) {
    result.reverse();
  }

  // 获取范围
  const members = result.slice(start, stop + 1).map((item) => item.member);

  return members;
}

/**
 * 模拟 KV exists 操作
 */
export async function exists(key: string): Promise<number> {
  return store[key] !== undefined ? 1 : 0;
}

/**
 * 清空所有数据 (仅用于测试)
 */
export function clearAll(): void {
  Object.keys(store).forEach((key) => delete store[key]);
  Object.keys(sortedSets).forEach((key) => delete sortedSets[key]);
}

/**
 * 获取所有数据 (仅用于调试)
 */
export function debugGetAll(): { store: LocalStore; sortedSets: typeof sortedSets } {
  return { store, sortedSets };
}

// 导出一个兼容 Vercel KV 的对象
export const localKV = {
  incr,
  set,
  get,
  zadd,
  zrange,
  exists,
};
