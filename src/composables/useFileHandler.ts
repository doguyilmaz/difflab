import { useJsonDiffStore } from '@/stores/counter'
import { useSettingsStore } from '@/stores/settings'

export function useFileHandler() {
  const store = useJsonDiffStore()
  const settingsStore = useSettingsStore()

  function handleFileRead(file: File, targetId: 'json1' | 'json2') {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        try {
          // Try to parse the JSON first
          const parsed = JSON.parse(content)
          
          // Format only if auto-format is enabled
          const finalContent = settingsStore.settings.autoFormatJson 
            ? JSON.stringify(parsed, null, 2)
            : content
          
          store.updateJsonFile(targetId, {
            content: finalContent,
            name: file.name,
            isValid: true,
            error: undefined,
            isEdited: false
          })
          
          resolve()
        } catch (error) {
          // If parsing fails, still store the content but mark as invalid
          store.updateJsonFile(targetId, {
            content: content,
            name: file.name,
            isValid: false,
            error: error instanceof Error ? error.message : 'Invalid JSON format',
            isEdited: false
          })
          
          reject(new Error(`Invalid JSON in file: ${file.name}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`))
      }
      
      reader.readAsText(file)
    })
  }

  function handleMultipleFiles(files: FileList) {
    const fileArray = Array.from(files)
    
    if (fileArray.length === 1) {
      // Single file - determine target based on current state
      const targetId = !store.json1.content.trim() ? 'json1' : 
                      !store.json2.content.trim() ? 'json2' : 'json1'
      
      if (store.json1.content.trim() && store.json2.content.trim() && targetId === 'json1') {
        const override = confirm('First input is already filled. Do you want to override?')
        if (!override) return Promise.resolve()
      }
      
      return handleFileRead(fileArray[0], targetId)
      
    } else if (fileArray.length === 2) {
      // Two files
      if (store.json1.content.trim() && store.json2.content.trim()) {
        const overrideBoth = confirm('Both inputs are already filled. Do you want to override both?')
        if (!overrideBoth) return Promise.resolve()
      }
      
      return Promise.all([
        handleFileRead(fileArray[0], 'json1'),
        handleFileRead(fileArray[1], 'json2')
      ]).then(() => {})
      
    } else if (fileArray.length > 2) {
      // More than 2 files
      const overrideAll = confirm(
        'Both inputs will be replaced, but only the first two files will be considered. Do you want to continue?'
      )
      if (!overrideAll) return Promise.resolve()
      
      return Promise.all([
        handleFileRead(fileArray[0], 'json1'),
        handleFileRead(fileArray[1], 'json2')
      ]).then(() => {})
    }
    
    return Promise.resolve()
  }

  function addEditedLabel(targetId: 'json1' | 'json2') {
    const target = targetId === 'json1' ? store.json1 : store.json2
    
    if (!target.name.includes('(edited)')) {
      store.updateJsonFile(targetId, {
        name: target.name + ' (edited)',
        isEdited: true
      })
    }
  }

  return {
    handleFileRead,
    handleMultipleFiles,
    addEditedLabel
  }
}