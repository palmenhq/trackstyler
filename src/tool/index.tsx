import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useCallback, useMemo, useState } from 'react'
import {
  Dropzone,
  DropzoneText,
  DropzoneTextSm,
  DropzoneTextSmMuted,
} from './dropzone'
import { TrackEditor } from './track-editor'
import ImportIcon from '../icons/import.svg?react'
import { getExtension, guessFormatFromExtension } from '../util/file-helpers'
import { TrackMetadataInfo, useProbeMetadata } from '../ffmpeg'
import { pushBottom, pushRightSm, pushTopXs } from '../design/style-utils.ts'
import { MainContainer } from '../design/layout'
import { trackLoadedTrack, trackProbedTrack } from '../util/tracker'

export type UploadedFile = {
  id: string
  file: File
  metadata?: Partial<TrackMetadataInfo>
}
const makeUploadedFile = (file: File): UploadedFile => ({
  id: crypto.randomUUID(),
  file,
})

const useTrackUpload = () => {
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([])
  const [invalidFiles, setInvalidFiles] = useState<File[]>([])
  const { probeMetadata } = useProbeMetadata()

  const addFile = useCallback(
    async (...files: File[]) => {
      const validFiles = files.filter((file) => {
        try {
          guessFormatFromExtension(file.name)
          return true
        } catch {
          return false
        }
      })

      const uploadedFiles = await Promise.all(
        validFiles.map(makeUploadedFile).map(async (file) => {
          try {
            trackLoadedTrack({
              sourceFormat: guessFormatFromExtension(file.file.name),
            })

            const metadata = await probeMetadata(file)
            trackProbedTrack({
              title: !!metadata?.title,
              artist: !!metadata?.artist,
              album: !!metadata?.album,
              albumCover: !!metadata?.albumCover,
              recordLabel: !!metadata?.label,
            })

            return {
              ...file,
              metadata,
            }
          } catch {
            return file
          }
        }),
      )

      setInvalidFiles(files.filter((file) => !validFiles.includes(file)))
      setCurrentFiles([...uploadedFiles, ...currentFiles])
    },
    [currentFiles, probeMetadata],
  )
  const invalidFileFormats = useMemo(
    () => [...new Set(invalidFiles.map((file) => getExtension(file.name)))],
    [invalidFiles],
  )

  const removeFile = useCallback(
    (fileToRemove: File) =>
      setCurrentFiles(currentFiles.filter(({ file }) => file !== fileToRemove)),
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
  return (
    <MainContainer>
      <h1 css={[pushBottom, pushTopXs]}>Styler tool</h1>

      <Dropzone
        onChange={handleFilesAdded}
        accept=".aif,.aiff,.wav,.mp3,.flac"
        multiple
        containerCss={css`
          padding: 2rem 1rem;
        `}
      >
        <DropzoneInstructions>
          <DropzoneInstructionsLeft>
            <ImportIcon css={[pushRightSm]} />
            <DropzoneText>Drop a track</DropzoneText>
          </DropzoneInstructionsLeft>
          <DropzoneInstructionsRight>
            <DropzoneTextSm>or click to select an audio file</DropzoneTextSm>
            <DropzoneTextSmMuted>
              <em>Supported formats: .wav, .aiff, .flac, .mp3</em>
            </DropzoneTextSmMuted>
          </DropzoneInstructionsRight>
        </DropzoneInstructions>
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
        {currentFiles.map((uploadedFile) => (
          <TrackEditor key={uploadedFile.id} file={uploadedFile} />
        ))}
      </TrackEditors>
    </MainContainer>
  )
}

export const TrackEdit = () => {
  const uploadProps = useTrackUpload()
  return <TrackEditView {...uploadProps} />
}

const DropzoneInstructions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`

const DropzoneInstructionsLeft = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const DropzoneInstructionsRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
`

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
