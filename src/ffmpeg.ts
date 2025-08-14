import { FFmpeg } from '@ffmpeg/ffmpeg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFile } from '@ffmpeg/util'
import { FileTuple } from './track-edit'

const ffmpegFileBase = ''

export const loadFfmpeg = async () => {
  const ffmpeg = new FFmpeg()

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      workerURL: `${ffmpegFileBase}/fmpc.worker.js`,
      coreURL: `${ffmpegFileBase}/fmpc.js`,
      wasmURL: `${ffmpegFileBase}/fmpc.wasm`,
      classWorkerURL: `${ffmpegFileBase}/fmp/worker.js`,
    })
  }

  return ffmpeg
}

export type Format = 'aiff' | 'wav' | 'mp3'
export type ConvertTrackOptions = {
  ffmpeg: FFmpeg
  format: Format
  fileName: string
  metadata: TrackMetadataInfo
}

const audioFormatMimeMap = {
  aiff: 'audio/aiff',
  wav: 'audio/wav',
  mp3: 'audio/mp3',
} as const

export const convertTrackWithoutAlbumCover = async ({
  ffmpeg,
  format,
  fileName,
  metadata,
}: ConvertTrackOptions) => {
  const outFileName = `${fileName}__out.${format}`
  const formatIsOriginal = !format || fileName.endsWith(format)

  console.debug(`Converting track ${fileName} to ${format}`)

  await ffmpeg.exec(
    [
      ['-i', fileName],
      ['-map', '0:0'],
      ['-id3v2_version', '3'],
      !!metadata.artist && ['-metadata', `artist=${metadata.artist}`],
      !!metadata.title && ['-metadata', `title=${metadata.title}`],
      !!metadata.album && ['-metadata', `album=${metadata.album}`],
      !!metadata.publisher && ['-metadata', `publisher=${metadata.publisher}`],
      format === 'mp3' && ['-b:a', '320k'],
      ['-write_id3v2', '1'],
      // for keeping original sound
      formatIsOriginal && ['-codec:a', 'copy'],
      outFileName,
    ]
      .filter(Boolean)
      .flat() as string[],
  )

  console.debug(`Conversion finished`)

  console.debug(`Reading file from vfs`, outFileName)
  const fetchedFile = await ffmpeg.readFile(outFileName)
  console.debug(`Read file`, fetchedFile)
  return new Blob([fetchedFile], {
    type: audioFormatMimeMap[format],
  })
}

export type TrackMetadataInfo = {
  title: string
  artist: string
  label?: string
  album?: string
  publisher?: string
  albumCover?: File
}

export const useTrackConvert = ({
  file,
  format,
  metadata,
}: {
  file: FileTuple
  format: Format
  metadata: TrackMetadataInfo
}) => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg>()
  const [preparedTrack, setPreparedTrack] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const ffmpegPath = `${file[0]}__${file[1].name}`

  useEffect(() => {
    if (ffmpeg) return

    loadFfmpeg().then((loadedFffmpeg) => {
      console.debug(`ffmpeg loaded`)
      setFfmpeg(loadedFffmpeg)
    })
  }, [ffmpeg])

  useEffect(() => {
    if (!ffmpeg?.loaded) return

    setIsBusy(true)
    Promise.resolve()
      .then(() => {
        console.debug(`ffmpeg loading file`, file[1])
        return fetchFile(file[1])
      })
      .then((fetchedFile) => {
        console.debug('file fetched, writing to vfs', ffmpegPath)
        return ffmpeg.writeFile(ffmpegPath, fetchedFile)
      })
      .then(() => setPreparedTrack(file[0]))
      .catch((e) => {
        console.error(e)
      })
      .finally(() => setIsBusy(false))
  }, [ffmpeg, ffmpegPath, file])

  // Reset preparedTrack
  useEffect(() => {
    if (preparedTrack !== null && preparedTrack !== file[0]) {
      setPreparedTrack(null)
      return
    }
  }, [preparedTrack, file])

  const convertTrack = useCallback(async () => {
    if (!preparedTrack || !ffmpeg) return

    if (metadata.albumCover) {
      throw new Error('Album cover: TODO')
    } else {
      setIsBusy(true)
      return convertTrackWithoutAlbumCover({
        ffmpeg,
        format,
        metadata,
        fileName: ffmpegPath,
      }).finally(() => setIsBusy(false))
    }
  }, [ffmpeg, ffmpegPath, format, metadata, preparedTrack])

  const actions = useMemo(
    () => ({
      isReady: preparedTrack === file[0],
      isBusy,
      convertTrack,
    }),
    [convertTrack, file, isBusy, preparedTrack],
  )

  return actions
}
