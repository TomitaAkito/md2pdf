import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PfpdfAPI, PfpdfProgressEvent, PdfGenerateOptions, CustomTemplateData } from '../shared/types'

// Custom APIs for renderer
const api = {}

const pfpdfAPI: PfpdfAPI = {
  testDummyPdf: () => ipcRenderer.invoke('pfpdf:test-dummy'),
  onProgress: (callback: (event: PfpdfProgressEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: PfpdfProgressEvent): void => {
      callback(data)
    }
    ipcRenderer.on('pfpdf:progress', listener)
    return () => {
      ipcRenderer.removeListener('pfpdf:progress', listener)
    }
  },
  selectMarkdownFile: () => ipcRenderer.invoke('pfpdf:select-markdown'),
  readMarkdownFile: (filePath: string) => ipcRenderer.invoke('pfpdf:read-markdown', filePath),
  selectPdfSavePath: (defaultFileName?: string) => ipcRenderer.invoke('pfpdf:select-save-path', defaultFileName),
  generatePdf: (options: PdfGenerateOptions) => ipcRenderer.invoke('pfpdf:generate', options),
  openPdf: (filePath: string) => ipcRenderer.invoke('pfpdf:open-pdf', filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke('pfpdf:show-in-folder', filePath),
  getOfficialTemplates: () => ipcRenderer.invoke('pfpdf:get-official-templates'),
  getPathForFile: (file: File) => {
    try {
      return webUtils.getPathForFile(file)
    } catch {
      return (file as any).path || ''
    }
  },
  parseMarkdownContent: (content: string, fileName: string, filePath?: string) =>
    ipcRenderer.invoke('pfpdf:parse-markdown-content', content, fileName, filePath),
  saveMarkdownFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('pfpdf:save-markdown', filePath, content),
  selectMarkdownSavePath: (defaultFileName?: string) =>
    ipcRenderer.invoke('pfpdf:select-markdown-save-path', defaultFileName),
  getCustomTemplates: () => ipcRenderer.invoke('pfpdf:get-custom-templates'),
  saveCustomTemplate: (template: CustomTemplateData) => ipcRenderer.invoke('pfpdf:save-custom-template', template),
  deleteCustomTemplate: (templateId: string) => ipcRenderer.invoke('pfpdf:delete-custom-template', templateId),

  // PPTX 関連 API
  selectPptxFile: () => ipcRenderer.invoke('pfpdf:select-pptx-file'),
  parsePptxFile: (filePath: string) => ipcRenderer.invoke('pfpdf:parse-pptx-file', filePath),
  parsePptxBuffer: (buffer: ArrayBuffer, fileName: string) =>
    ipcRenderer.invoke('pfpdf:parse-pptx-buffer', buffer, fileName),
  exportPptxSample: (sampleType?: 'business' | 'tech' | 'academic') =>
    ipcRenderer.invoke('pfpdf:export-pptx-sample', sampleType)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('pfpdfAPI', pfpdfAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.pfpdfAPI = pfpdfAPI
}
