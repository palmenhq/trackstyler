import { useTrackConvert } from '../ffmpeg'
import { triggerDownload } from '../util/file-helpers'
import { trackSaveTrackFinished, trackSaveTrackStarted } from '../util/tracker'
import { isSingleMode, WithEditMode } from './edit-mode.ts'
import { FileAndState, useTrackEditorState } from './state.ts'
import { SingleTrackEditor } from './single-track-editor.tsx'

export const TrackEditor: React.FC<
  WithEditMode & {
    fileAndState: FileAndState
  }
> = ({ fileAndState, editMode }) => {
  const [trackEditorState, setTrackEditorState] =
    useTrackEditorState(fileAndState)

  const trackConverter = useTrackConvert({
    uploadedFile: fileAndState.uploadedFile,
    targetFormat: trackEditorState.targetFormat,
    sourceFormat: trackEditorState.sourceFormat,
    metadata: {
      title: trackEditorState.cleanTitle,
      artist: trackEditorState.cleanArtist,
      album: trackEditorState.cleanAlbum,
      publisher: trackEditorState.cleanRecordLabel,
      albumCover: trackEditorState.albumCover,
    },
  })

  return (
    <>
      {isSingleMode(editMode) && (
        <SingleTrackEditor
          trackState={trackEditorState}
          setTrackState={setTrackEditorState}
          uploadedFile={fileAndState.uploadedFile}
          onDownload={() => {
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

            trackConverter.convertTrack().then((convertedTrackBlob) => {
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
          }}
          trackConverter={trackConverter}
        />
      )}
    </>
  )
}
