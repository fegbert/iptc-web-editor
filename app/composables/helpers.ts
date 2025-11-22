import type { FileWithHandle } from 'browser-fs-access'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'

/**
 * Loads data from IndexedDB for a given key.
 * @param key The key to load data for.
 * @param defaultValue The default value to return if no data is found.
 * @returns The data associated with the key or the default value.
 */
export async function loadFromIdb<T>(key: string, defaultValue: T): Promise<T | undefined> {
  const { data, isFinished } = useIDBKeyval<T>(key, defaultValue)

  await until(isFinished).toBe(true)

  return data.value
}

/**
 * Generates a unique ID for a given file.
 * @param file The file for which to generate an ID.
 * @returns A unique string ID for the file.
 */
export function getFileId(file: FileWithHandle): string {
  return file.name + file.lastModified + file.size
}

/**
 * Deeploy converts a reactive object to its raw form so it can savely be stored in IndexedDB.
 * @param obj The object to convert. Can be anything.
 * @returns The raw version of the object.
 */
function toRawDeep(obj: any): any {
  if (Array.isArray(obj) && isReactive(obj)) {
    return toRaw(obj.map(item => toRawDeep(item)))
  }

  return isReactive(obj) ? toRaw(obj) : obj
}

/**
 * Updates data in IndexedDB for a given key.
 * @param key The key to update data for.
 * @param data The data to be stored.
 */
export async function updateIdb<T>(key: string, data: T) {
  const { set } = useIDBKeyval<T>(key, data)
  const rawData = toRawDeep(data)

  await set(rawData)
}
