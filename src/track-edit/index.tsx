import {
  Dropzone,
  DropzoneText,
  DropzoneTextSm,
  DropzoneTextSmMuted,
} from './dropzone'
import { useCallback, useMemo, useState } from 'react'
import { TrackEditor } from './track-editor'
import { css } from '@emotion/react'
import { getExtension, guessFormatFromExtension } from '../util/file-helpers'
import styled from '@emotion/styled'

export type UploadedFile = [string, File]
const makeFileTuple = (file: File): UploadedFile => [crypto.randomUUID(), file]

const useTrackUpload = () => {
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([])
  const [invalidFiles, setInvalidFiles] = useState<File[]>([])

  const addFile = useCallback(
    (...files: File[]) => {
      const validFiles = files.filter((file) => {
        try {
          guessFormatFromExtension(file.name)
          return true
        } catch {
          return false
        }
      })

      setInvalidFiles(files.filter((file) => !validFiles.includes(file)))
      setCurrentFiles([...currentFiles, ...validFiles.map(makeFileTuple)])
    },
    [currentFiles],
  )
  const invalidFileFormats = useMemo(
    () => [...new Set(invalidFiles.map((file) => getExtension(file.name)))],
    [invalidFiles],
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
    invalidFileFormats: invalidFileFormats,
  }
}

type FileUploadActions = ReturnType<typeof useTrackUpload>

export const TrackEditView: React.FC<FileUploadActions> = ({
  handleFilesAdded,
  currentFiles,
  invalidFileFormats,
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

      {invalidFileFormats.length > 1 && (
        <ErrorText>
          File formats {invalidFileFormats.join(', ')} not supported
        </ErrorText>
      )}
      {invalidFileFormats.length === 1 && (
        <ErrorText>File format {invalidFileFormats[0]} not supported</ErrorText>
      )}

      <TrackEditors>
        {recentFiles.map((fileTuple) => (
          <TrackEditor key={fileTuple[0]} file={fileTuple} />
        ))}
      </TrackEditors>
    </div>
  )
}

export const TrackEdit = () => {
  const uploadProps = useTrackUpload()
  return <TrackEditView {...uploadProps} />
}

const ErrorText = styled.div`
  padding-top: 0.5rem;
  color: var(--color-error);
`

const TrackEditors = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 2rem;
`
