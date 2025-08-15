import { FFmpeg } from '@ffmpeg/ffmpeg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFile } from '@ffmpeg/util'
import { UploadedFile } from './track-edit'

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
  targetFormat: Format
  fileName: string
  metadata: TrackMetadataInfo
}

const audioFormatMimeMap = {
  aiff: 'audio/aiff',
  wav: 'audio/wav',
  mp3: 'audio/mp3',
} as const

export const ffmpegConvertTrack = async ({
  ffmpeg,
  targetFormat,
  fileName,
  metadata,
}: ConvertTrackOptions) => {
  const outFileName = `${fileName}__out.${targetFormat}`
  const formatIsOriginal = fileName.endsWith(targetFormat)

  console.debug(`Converting track ${fileName} to ${targetFormat}`)

  if (metadata.albumCover) {
    const conversionId = crypto.randomUUID()
    const originalAlbumCoverFilename = `${conversionId}_${metadata.albumCover.name}`
    const albumCoverFilename = `${conversionId}_${metadata.albumCover.name}.jpg`
    await ffmpeg.writeFile(
      originalAlbumCoverFilename,
      await fetchFile(metadata.albumCover),
    )
    await ffmpeg.exec(
      [
        ['-i', originalAlbumCoverFilename],
        [
          '-vf',
          // Crop to square, then scale to 3000x3000 if it's > 3000:3000 px
          "crop='min(in_w\\,in_h)':'min(in_w\\,in_h)',scale='if(gt(in_w\\,3000),3000,in_w)':'if(gt(in_h\\,3000),3000,in_h)'",
        ],
        ['-q', '0.9'],
        albumCoverFilename,
      ].flat(),
    )

    await ffmpeg.exec(
      [
        ['-i', fileName],
        ['-i', albumCoverFilename],
        ['-map', '0:0'],
        ['-map', '1:0'],
        ['-id3v2_version', '3'],
        ['-metadata:s:v', 'title="Album cover"'],
        ['-metadata:s:v', 'comment="Cover (front)"'],
        !!metadata.artist && ['-metadata', `artist=${metadata.artist}`],
        !!metadata.title && ['-metadata', `title=${metadata.title}`],
        !!metadata.album && ['-metadata', `album=${metadata.album}`],
        !!metadata.publisher && [
          '-metadata',
          `publisher=${metadata.publisher}`,
        ],
        targetFormat === 'mp3' && ['-b:a', '320k'],
        ['-write_id3v2', '1'],
        // for keeping original sound
        formatIsOriginal && ['-codec:a', 'copy'],
        ['-codec:v', 'copy'],
        outFileName,
      ]
        .filter(Boolean)
        .flat() as string[],
    )
  } else {
    await ffmpeg.exec(
      [
        ['-i', fileName],
        ['-map', '0:0'],
        ['-id3v2_version', '3'],
        !!metadata.artist && ['-metadata', `artist=${metadata.artist}`],
        !!metadata.title && ['-metadata', `title=${metadata.title}`],
        !!metadata.album && ['-metadata', `album=${metadata.album}`],
        !!metadata.publisher && [
          '-metadata',
          `publisher=${metadata.publisher}`,
        ],
        targetFormat === 'mp3' && ['-b:a', '320k'],
        ['-write_id3v2', '1'],
        // for keeping original sound
        formatIsOriginal && ['-codec:a', 'copy'],
        outFileName,
      ]
        .filter(Boolean)
        .flat() as string[],
    )
  }
  console.debug(`Conversion finished`)

  console.debug(`Reading file from vfs`, outFileName)
  const fetchedFile = await ffmpeg.readFile(outFileName)
  console.debug(`Read file`, fetchedFile)
  return new Blob([fetchedFile], {
    type: audioFormatMimeMap[targetFormat],
  })
}

export type TrackMetadataInfo = {
  title: string
  artist: string
  label?: string
  album?: string
  publisher?: string
  albumCover?: File | null
}

export const useTrackConvert = ({
  file,
  targetFormat,
  sourceFormat,
  metadata,
}: {
  file: UploadedFile
  targetFormat: Format
  sourceFormat: Format
  metadata: TrackMetadataInfo
}) => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg>()
  const [preparedTrack, setPreparedTrack] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const ffmpegPath = `${file[0]}__input.${sourceFormat}`

  useEffect(() => {
    if (ffmpeg) return

    loadFfmpeg().then((loadedFffmpeg) => {
      console.debug(`ffmpeg loaded`)
      setFfmpeg(loadedFffmpeg)
    })
  }, [ffmpeg])

  useEffect(() => {
    if (!ffmpeg?.loaded) return

    if (!!preparedTrack && file[0] === preparedTrack) {
      return
    }

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
  }, [ffmpeg, ffmpegPath, file, preparedTrack])

  // Reset preparedTrack
  useEffect(() => {
    if (preparedTrack !== null && preparedTrack !== file[0]) {
      setPreparedTrack(null)
      return
    }
  }, [preparedTrack, file])

  const convertTrack = useCallback(async () => {
    if (!preparedTrack || !ffmpeg) return

    setIsBusy(true)
    return ffmpegConvertTrack({
      ffmpeg,
      targetFormat,
      metadata,
      fileName: ffmpegPath,
    }).finally(() => setIsBusy(false))
  }, [ffmpeg, ffmpegPath, targetFormat, metadata, preparedTrack])

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
