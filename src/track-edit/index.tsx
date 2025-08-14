import {
  Dropzone,
  DropzoneText,
  DropzoneTextSm,
  DropzoneTextSmMuted,
} from './dropzone'
import { useCallback, useMemo, useState } from 'react'
import { TrackEditor } from './track-editor'
import { css } from '@emotion/react'

export type FileTuple = [string, File]
const makeFileTuple = (file: File): FileTuple => [crypto.randomUUID(), file]

const useTrackUpload = () => {
  const [currentFiles, setCurrentFiles] = useState<FileTuple[]>([])
  const addFile = useCallback(
    (...files: File[]) =>
      setCurrentFiles([...currentFiles, ...files.map(makeFileTuple)]),
    [currentFiles],
  )
  const removeFile = useCallback(
    (fileToRemove: File) =>
      setCurrentFiles(currentFiles.filter(([, file]) => file !== fileToRemove)),
    [currentFiles],
  )
  const handleFilesAdded = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (e) => {
      if (!e.target.files) {
        return
      }

      addFile(...e.target.files)
    },
    [addFile],
  )

  return {
    addFile,
    removeFile,
    handleFilesAdded,
    currentFiles,
    setCurrentFiles,
  }
}

type FileUploadActions = ReturnType<typeof useTrackUpload>

export const TrackEditView: React.FC<FileUploadActions> = ({
  handleFilesAdded,
  currentFiles,
}) => {
  const recentFiles = useMemo(() => [...currentFiles].reverse(), [currentFiles])
  return (
    <div>
      <Dropzone
        onChange={handleFilesAdded}
        accept=".aif,.aiff,.wav,.mp3"
        multiple
        containerCss={css`
          padding: 2rem 1rem;
        `}
      >
        <DropzoneText>Drop a track</DropzoneText>
        <DropzoneTextSm>or click to select an audio file</DropzoneTextSm>
        <DropzoneTextSmMuted>
          <em>Supported formats: .wav, .aiff, .mp3</em>
        </DropzoneTextSmMuted>
      </Dropzone>
      {recentFiles.map((fileTuple) => (
        <TrackEditor key={fileTuple[0]} file={fileTuple} />
      ))}
    </div>
  )
}

export const TrackEdit = () => {
  const uploadProps = useTrackUpload()
  return <TrackEditView {...uploadProps} />
}
