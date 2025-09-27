import { atom, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import {
  cleanString,
  guessFormatFromExtension,
  removeExtension,
} from '../util/file-helpers.ts'
import { UploadedFile } from './index.tsx'
import { Format } from '../ffmpeg.tsx'

export type TrackFormState = {
  title: string
  artist: string
  recordLabel: string
  album: string
  selectedFormat: Format
  albumCover: File | null
}

export type TrackState = TrackFormState & {
  cleanTitle: string
  cleanArtist: string
  cleanRecordLabel: string
  cleanAlbum: string
  newFileName: string
  sourceFormat: Format
  targetFormat: Format
  albumCoverUrl: string | null
}

export type FileAndState = {
  state?: TrackFormState
  uploadedFile: UploadedFile
}
export const trackUploadsAtom = atom<Array<FileAndState>>([])

export const getTrackFormState = (
  uploadedFileAndState: FileAndState,
  sourceFormat: 'aiff' | 'wav' | 'flac' | 'mp3',
) =>
  uploadedFileAndState.state ?? {
    title: uploadedFileAndState.uploadedFile.metadata?.title ?? '',
    artist: uploadedFileAndState.uploadedFile.metadata?.artist ?? '',
    album: uploadedFileAndState.uploadedFile.metadata?.album ?? '',
    albumCover: uploadedFileAndState.uploadedFile.metadata?.albumCover ?? null,
    recordLabel: uploadedFileAndState.uploadedFile.metadata?.publisher ?? '',
    selectedFormat: sourceFormat,
  }

export const getEnhancedTrackData = (
  trackForm: TrackFormState,
  uploadedFile: UploadedFile,
  sourceFormat: Format,
  albumCoverUrl: string | null,
) => {
  const cleanTitle = trackForm.title.trim()
  const cleanArtist = trackForm.artist.trim()
  const cleanRecordLabel = trackForm.recordLabel.trim()
  const cleanAlbum = trackForm.album.trim()

  const serializedFileName =
    !!cleanTitle && !!cleanArtist
      ? serializeFileName({
          title: cleanTitle,
          artist: cleanArtist,
          recordLabel: cleanRecordLabel,
        })
      : removeExtension(uploadedFile.file.name)

  return {
    ...trackForm,
    cleanTitle,
    cleanArtist,
    cleanRecordLabel,
    cleanAlbum: cleanAlbum,
    newFileName: serializedFileName,
    sourceFormat,
    targetFormat: trackForm.selectedFormat || sourceFormat,
    albumCoverUrl,
  }
}

export const useTrackEditorState = (uploadedFileAndState: FileAndState) => {
  const setTracks = useSetAtom(trackUploadsAtom)

  const uploadedFile = useMemo(
    () => uploadedFileAndState.uploadedFile,
    [uploadedFileAndState.uploadedFile],
  )

  const sourceFormat = useMemo(
    () => guessFormatFromExtension(uploadedFile.file.name),
    [uploadedFile.file.name],
  )

  const trackForm = useMemo(
    () => getTrackFormState(uploadedFileAndState, sourceFormat),
    [sourceFormat, uploadedFileAndState],
  )

  const albumCoverUrl = useMemo(() => {
    const coverWithDefault =
      trackForm.albumCover ?? uploadedFile.metadata?.albumCover
    if (coverWithDefault) {
      return URL.createObjectURL(coverWithDefault)
    } else {
      return null
    }
  }, [trackForm.albumCover, uploadedFile.metadata?.albumCover])

  const enhancedTrack = useMemo<TrackState>(() => {
    return getEnhancedTrackData(
      trackForm,
      uploadedFile,
      sourceFormat,
      albumCoverUrl,
    )
  }, [trackForm, uploadedFile, sourceFormat, albumCoverUrl])

  const setTrack = useCallback(
    (newValues: Partial<Optional<TrackFormState>>) =>
      setTracks((prev) =>
        prev.map((track) => {
          if (track.uploadedFile.id === uploadedFileAndState.uploadedFile.id) {
            return {
              ...track,
              state: {
                ...trackForm,
                ...newValues,
              },
            }
          } else {
            return track
          }
        }),
      ),
    [setTracks, trackForm, uploadedFileAndState.uploadedFile.id],
  )

  return useMemo(
    () => [enhancedTrack, setTrack] as const,
    [enhancedTrack, setTrack],
  )
}

type Optional<T> = {
  [key in keyof T]: T[key] | undefined
}

const serializeFileName = ({
  title,
  artist,
  recordLabel,
}: {
  title: string
  artist: string
  recordLabel: string
}) => {
  let newName = `${artist} - ${title}`
  const cleanRecordLabel = cleanString(recordLabel).trim()
  if (cleanRecordLabel) {
    newName += ` [${cleanRecordLabel}]`
  }
  const safeNewName = cleanString(newName).replace(/\s{2,}/g, ' ')
  return safeNewName
}

export const makeFormHandler =
  (trackState: TrackFormState, setter: (s: Partial<TrackFormState>) => void) =>
  <TProp extends keyof TrackFormState>(property: TProp) => ({
    value: trackState[property] ?? undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setter({ [property]: e.target.value }),
  })

export const multiFormatAtom = atom<Format>('aiff')

export const downloadersRegistryAtom = atom(new Set<() => Promise<void>>())
