import { Format } from '../ffmpeg'

export const removeExtension = (fileName: string) =>
  fileName.replace(/\.\w+$/, '')
export const getExtension = (fileName: string) => fileName.replace(/^.*\./, '')
export const guessFormatFromExtension = (fileName: string): Format => {
  const extension = getExtension(fileName)
  switch (extension) {
    case 'wav':
      return 'wav'
    case 'mp3':
      return 'mp3'
    case 'aif':
    case 'aiff':
      return 'aiff'
    case 'flac':
      return 'flac'
    default:
      throw new Error(`Unsupported file type "${extension}"`)
  }
}

export const cleanString = (str: string) =>
  str.replace(/[^\w\-_+()[\]:,.<>\s]/g, '')

export const triggerDownload = (downloadName: string, file: Blob) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = downloadName
  a.style.width = '1px'
  a.style.height = '1px'
  a.style.opacity = '0'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
