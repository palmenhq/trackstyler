import { FFmpeg } from '@ffmpeg/ffmpeg'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fetchFile } from '@ffmpeg/util'
import { UploadedFile } from './track-edit'

const ffmpegFileBase = ''

const loadFfmpeg = async () => {
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

export type Format = 'aiff' | 'wav' | 'flac' | 'mp3'
export type ConvertTrackOptions = {
  ffmpeg: FFmpeg
  targetFormat: Format
  fileName: string
  metadata: TrackMetadataInfo
}

const audioFormatMimeMap = {
  aiff: 'audio/aiff',
  wav: 'audio/wav',
  flac: 'audio/flac',
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

  if (metadata.albumCover) {
    const conversionId = crypto.randomUUID()
    const originalAlbumCoverFilename = `${conversionId}_${metadata.albumCover.name}`
    const albumCoverFilename = `${conversionId}_${metadata.albumCover.name}__albumCover.jpg`
    console.debug('Writing album cover file', albumCoverFilename)
    await ffmpeg.writeFile(
      originalAlbumCoverFilename,
      await fetchFile(metadata.albumCover),
    )
    console.debug('Resizing & converting album cover file', albumCoverFilename)
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
    console.debug('Successfully converted album cover file', albumCoverFilename)

    console.debug(`Converting track ${fileName} to ${targetFormat}`)

    await ffmpeg.exec(
      [
        ['-i', fileName],
        ['-i', albumCoverFilename],
        ['-map', '0:a'],
        ['-map', '1:v'],
        ['-id3v2_version', '3'],
        ['-map_metadata', '0'],
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
        targetFormat === 'flac' && ['-disposition:v', 'attached_pic'],
        outFileName,
      ]
        .filter(Boolean)
        .flat() as string[],
    )
  } else {
    console.debug(`Converting track ${fileName} to ${targetFormat}`)

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
  console.debug(`Read file`, outFileName)

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
  const ffmpeg = useFfmpeg()
  const [preparedTrack, setPreparedTrack] = useState<string | null>(null)
  const [conversionInProgress, setConversionInProgress] = useState(false)
  const loadingRef = useRef<string | null>(null)
  const ffmpegPath = `${file.id}__input.${sourceFormat}`

  useEffect(() => {
    if (!ffmpeg?.loaded) return

    console.debug(
      'loading track status',
      preparedTrack,
      file.id,
      loadingRef.current,
    )
    if (!!preparedTrack && file.id === preparedTrack) {
      return
    }

    if (loadingRef.current) {
      return
    } else {
      loadingRef.current = file.id
    }

    Promise.resolve()
      .then(() => {
        console.debug(`ffmpeg loading file`, file.file)
        return fetchFile(file.file)
      })
      .then((fetchedFile) => {
        console.debug('file fetched, writing to vfs', ffmpegPath)
        return ffmpeg.writeFile(ffmpegPath, fetchedFile)
      })
      .then(() => setPreparedTrack(file.id))
      .catch((e) => {
        console.error('Error loading track', e)
      })
      .finally(() => {
        console.debug(`ffmpeg loaded file`, file.file)
        loadingRef.current = null
      })
  }, [ffmpeg, ffmpegPath, file, preparedTrack])

  // Reset preparedTrack
  useEffect(() => {
    if (preparedTrack !== null && preparedTrack !== file.id) {
      setPreparedTrack(null)
      return
    }
  }, [preparedTrack, file])

  const convertTrack = useCallback(async () => {
    if (!preparedTrack || !ffmpeg) return

    setConversionInProgress(true)
    return ffmpegConvertTrack({
      ffmpeg,
      targetFormat,
      metadata,
      fileName: ffmpegPath,
    }).finally(() => setConversionInProgress(false))
  }, [ffmpeg?.loaded, ffmpegPath, targetFormat, metadata, preparedTrack])

  const actions = useMemo(
    () => ({
      isReady: preparedTrack === file.id,
      isBusy: conversionInProgress || !!loadingRef.current,
      convertTrack,
    }),
    [conversionInProgress, convertTrack, file.id, preparedTrack],
  )

  return actions
}

const ffProbe = async (
  ffmpeg: FFmpeg,
  file: UploadedFile,
  probeEntries: string,
) => {
  const probeFilename = `${file.id}_probe_${file.file.name}`
  await ffmpeg.writeFile(probeFilename, await fetchFile(file.file))

  const probedInfoFileName = `${file.id}__probed.txt`
  await ffmpeg.ffprobe(
    [
      [probeFilename],
      ['-loglevel', 'error'],
      ['-show_entries', probeEntries],
      ['-of', 'default=noprint_wrappers=1'],
      ['-o', probedInfoFileName],
    ].flat(),
  )

  const probedData = await ffmpeg.readFile(probedInfoFileName, 'utf8')

  if (typeof probedData !== 'string') {
    console.warn(
      'Expected probed file data to be string but was ',
      typeof probedData,
    )
    return
  }

  return probedData
}

const probeAlbumCoverFile = async (
  ffmpeg: FFmpeg,
  file: UploadedFile,
): Promise<File | null> => {
  const trackFileName = `${file.id}__getAlbum__${file.file.name}`
  const albumCoverFileName = `${file.id}-_getAlbum_out.jpg`
  await ffmpeg.writeFile(trackFileName, await fetchFile(file.file))
  // -i file.mp3 -an -c:v copy file.jpg
  await ffmpeg.exec(
    [
      ['-i', trackFileName],
      ['-an'],
      ['-c:v', 'copy'],
      [albumCoverFileName],
    ].flat(),
  )

  const albumCoverRaw = await ffmpeg.readFile(albumCoverFileName)
  if (!(albumCoverRaw instanceof Uint8Array)) {
    {
      throw new Error(
        `Expected album cover file to be Uint8Array but was ${typeof albumCoverRaw}`,
      )
    }
  }
  const albumCoverFile = new File([albumCoverRaw], albumCoverFileName, {
    type: 'image/jpeg',
  })

  return albumCoverFile
}

export const useProbeMetadata = () => {
  const ffmpeg = useFfmpeg()

  const probeMetadata = useCallback(
    async (
      file: UploadedFile,
    ): Promise<Partial<TrackMetadataInfo> | undefined> => {
      if (!ffmpeg?.loaded || !ffmpeg) return

      const probedDataPlainText = await ffProbe(
        ffmpeg,
        file,
        'format_tags=title,artist,album,publisher',
      )

      if (!probedDataPlainText) return

      const textMetadata = Object.fromEntries(
        probedDataPlainText
          .split('\n')
          .filter(Boolean)
          .map((row) => {
            const [artist, ...titleParts] = row.replace(/^TAG:/, '').split('=')

            return [artist, titleParts.join('=')]
          }),
      )
      const albumCover = await probeAlbumCoverFile(ffmpeg, file)

      return { ...textMetadata, albumCover }
    },
    [ffmpeg],
  )

  return {
    probeMetadata,
  }
}

const ffmpegContext = createContext<FFmpeg | null>(null)

export const FfmpegProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ffmpeg?.loaded || isLoading) return

    setIsLoading(true)
    loadFfmpeg().then((loadedFffmpeg) => {
      console.debug(`ffmpeg loaded`)
      setFfmpeg(loadedFffmpeg)
      loadedFffmpeg.on('log', (m) => {
        if (m.type === 'stderr') {
          console.warn('FFMPEG log: ', m.message)
        } else {
          console.info('FFMPEG log: ', m.message)
        }
      })
      setIsLoading(false)
    })
  }, [ffmpeg?.loaded, isLoading])

  return (
    <ffmpegContext.Provider value={ffmpeg}>{children}</ffmpegContext.Provider>
  )
}
export const useFfmpeg = (): FFmpeg | null => {
  return useContext(ffmpegContext)
}
