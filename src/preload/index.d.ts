import { ElectronAPI } from '@electron-toolkit/preload'
import { PfpdfAPI } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    pfpdfAPI: PfpdfAPI
  }
}
