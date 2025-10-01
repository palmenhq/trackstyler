import { useTrackConvert } from '../ffmpeg'
import { triggerDownload } from '../util/file-helpers'
import { trackSaveTrackFinished, trackSaveTrackStarted } from '../util/tracker'
import { isMultiMode, isSingleMode, WithEditMode } from './edit-mode.ts'
import { FileAndState, multiFormatAtom, useTrackEditorState } from './state.ts'
import { SingleTrackEditor } from './single-track-editor.tsx'
import { MultiTrackEditorRow } from './multi-track-editor-row.tsx'
import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

export const TrackEditor: React.FC<
  WithEditMode & {
    fileAndState: FileAndState
    isFirstRow?: boolean
    registerDownloadAction?: (action: () => Promise<void>) => void
  }
> = ({ fileAndState, editMode }) => {
  const [trackEditorState, setTrackEditorState] =
    useTrackEditorState(fileAndState)
  const multiFormat = useAtomValue(multiFormatAtom)

  const targetFormatWithMulti =
    isMultiMode(editMode) && trackEditorState.sourceFormat !== 'mp3'
      ? multiFormat
      : trackEditorState.targetFormat
  const trackConverter = useTrackConvert({
    uploadedFile: fileAndState.uploadedFile,
    targetFormat: targetFormatWithMulti,
    sourceFormat: trackEditorState.sourceFormat,
    metadata: {
      title: trackEditorState.cleanTitle,
      artist: trackEditorState.cleanArtist,
      album: trackEditorState.cleanAlbum,
      publisher: trackEditorState.cleanRecordLabel,
      albumCover: trackEditorState.albumCover,
    },
  })

  const handleDownload = useCallback(() => {
    trackSaveTrackStarted({
      targetFormat: trackEditorState.targetFormat,
      sourceFormat: trackEditorState.sourceFormat,
      filledTitle: !!trackEditorState.cleanTitle,
      filledAlbum: !!trackEditorState.cleanAlbum,
      filledArtist: !!trackEditorState.cleanArtist,
      filledAlbumCover: !!trackEditorState.albumCoverUrl,
      filledRecordLabel: !!trackEditorState.cleanRecordLabel,
    })
    const startSaveTime = Date.now()

    return trackConverter.convertTrack().then((convertedTrackBlob) => {
      if (convertedTrackBlob) {
        triggerDownload(
          `${trackEditorState.newFileName}.${trackEditorState.targetFormat}`,
          convertedTrackBlob,
        )
      }

      trackSaveTrackFinished({
        sourceFormat: trackEditorState.sourceFormat,
        targetFormat: trackEditorState.targetFormat,
        saveTime_ms: Date.now() - startSaveTime,
      })
    })
  }, [
    trackConverter,
    trackEditorState.albumCoverUrl,
    trackEditorState.cleanAlbum,
    trackEditorState.cleanArtist,
    trackEditorState.cleanRecordLabel,
    trackEditorState.cleanTitle,
    trackEditorState.newFileName,
    trackEditorState.sourceFormat,
    trackEditorState.targetFormat,
  ])

  return (
    <>
      {isSingleMode(editMode) && (
        <SingleTrackEditor
          trackState={trackEditorState}
          setTrackState={setTrackEditorState}
          uploadedFile={fileAndState.uploadedFile}
          onDownload={handleDownload}
          trackConverter={trackConverter}
        />
      )}
      {isMultiMode(editMode) && (
        <MultiTrackEditorRow
          fileAndState={fileAndState}
          targetFormatWithMulti={targetFormatWithMulti}
          onDownload={handleDownload}
          trackConverter={trackConverter}
        />
      )}
    </>
  )
}
