import { ref, watch } from 'vue'
import { createTwoFilesPatch } from 'diff'
import { useJsonDiffStore, type ComparisonResult } from '@/stores/counter'

export function useJsonDiff() {
  const store = useJsonDiffStore()
  const isComparing = ref(false)

  function validateJson(jsonString: string): { valid: boolean; error?: string } {
    try {
      JSON.parse(jsonString)
      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON'
      }
    }
  }

  function findMissingKeys(
    source: Record<string, any>, 
    target: Record<string, any>, 
    compareValues: boolean
  ): Record<string, any> {
    const missingKeys: Record<string, any> = {}

    function recurse(sourceObj: any, targetObj: any, result: any) {
      for (const key in targetObj) {
        if (!(key in sourceObj)) {
          result[key] = targetObj[key]
        } else if (
          typeof targetObj[key] === 'object' && 
          typeof sourceObj[key] === 'object' && 
          targetObj[key] !== null && 
          sourceObj[key] !== null &&
          !Array.isArray(targetObj[key]) &&
          !Array.isArray(sourceObj[key])
        ) {
          result[key] = {}
          recurse(sourceObj[key], targetObj[key], result[key])
          if (Object.keys(result[key]).length === 0) delete result[key]
        } else if (compareValues && targetObj[key] !== sourceObj[key]) {
          result[key] = {
            valueInFirst: sourceObj[key],
            valueInSecond: targetObj[key]
          }
        }
      }
    }

    recurse(source, target, missingKeys)
    return missingKeys
  }

  function generateDiffHtml(
    json1: Record<string, any>,
    json2: Record<string, any>,
    compareValues: boolean
  ): string {
    let diffHtml = ''

    function generateDiff(sourceObj: any, targetObj: any, path = '') {
      for (const key in targetObj) {
        const currentPath = path ? `${path}.${key}` : key
        if (!(key in sourceObj)) {
          diffHtml += `<div class="text-green-600">+ ${currentPath}</div>`
        } else if (
          typeof targetObj[key] === 'object' && 
          typeof sourceObj[key] === 'object' && 
          targetObj[key] !== null && 
          sourceObj[key] !== null &&
          !Array.isArray(targetObj[key]) &&
          !Array.isArray(sourceObj[key])
        ) {
          generateDiff(sourceObj[key], targetObj[key], currentPath)
        } else if (compareValues && targetObj[key] !== sourceObj[key]) {
          diffHtml += `<div class="text-orange-600">~ ${currentPath}: "${sourceObj[key]}" → "${targetObj[key]}"</div>`
        }
      }

      for (const key in sourceObj) {
        const currentPath = path ? `${path}.${key}` : key
        if (!(key in targetObj)) {
          diffHtml += `<div class="text-red-600">- ${currentPath}</div>`
        }
      }
    }

    generateDiff(json1, json2)
    return diffHtml || '<div class="text-gray-500">No differences found.</div>'
  }

  async function compareJsonFiles(): Promise<ComparisonResult | null> {
    if (!store.hasJsonFiles) {
      return null
    }

    isComparing.value = true

    try {
      const json1Validation = validateJson(store.json1.content)
      const json2Validation = validateJson(store.json2.content)

      store.updateJsonFile('json1', {
        isValid: json1Validation.valid,
        error: json1Validation.error
      })

      store.updateJsonFile('json2', {
        isValid: json2Validation.valid,
        error: json2Validation.error
      })

      if (!json1Validation.valid || !json2Validation.valid) {
        return null
      }

      const json1Obj = JSON.parse(store.json1.content)
      const json2Obj = JSON.parse(store.json2.content)

      const missingInFirst = findMissingKeys(json1Obj, json2Obj, store.compareValues)
      const missingInSecond = findMissingKeys(json2Obj, json1Obj, store.compareValues)
      const diffHtml = generateDiffHtml(json1Obj, json2Obj, store.compareValues)

      const hasChanges = Object.keys(missingInFirst).length > 0 || 
                        Object.keys(missingInSecond).length > 0

      const result: ComparisonResult = {
        missingInFirst,
        missingInSecond,
        diffHtml,
        hasChanges
      }

      store.setComparisonResult(result)
      return result

    } catch (error) {
      console.error('Comparison error:', error)
      return null
    } finally {
      isComparing.value = false
    }
  }

  watch(
    [() => store.json1.content, () => store.json2.content, () => store.compareValues],
    () => {
      if (store.hasJsonFiles) {
        compareJsonFiles()
      } else {
        store.resetComparison()
      }
    },
    { immediate: true }
  )

  return {
    isComparing,
    validateJson,
    compareJsonFiles
  }
}