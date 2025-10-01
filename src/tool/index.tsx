import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dropzone,
  DropzoneText,
  DropzoneTextSm,
  DropzoneTextSmMuted,
} from './dropzone'
import { TrackEditor } from './track-editor'
import ImportIcon from '../icons/import.svg?react'
import ExportIcon from '../icons/export.svg?react'
import LoadingIcon from '../icons/loading.svg?react'
import { getExtension, guessFormatFromExtension } from '../util/file-helpers'
import { Format, TrackMetadataInfo, useProbeMetadata } from '../ffmpeg'
import {
  pushBottom,
  pushRightSm,
  pushTopXs,
  spin,
} from '../design/style-utils.ts'
import { MainInnerContainer, MainOuterContainer } from '../design/layout'
import { trackLoadedTrack, trackProbedTrack } from '../util/tracker'
import { Selector, SelectorOption } from '../design/selector.tsx'
import {
  EditMode,
  isMultiMode,
  isSingleMode,
  WithEditMode,
} from './edit-mode.ts'
import { useAtom, useAtomValue } from 'jotai'
import {
  downloadersRegistryAtom,
  multiFormatAtom,
  trackUploadsAtom,
} from './state.ts'
import {
  MultiEditorHeaderRow,
  MultiEditorTable,
} from './multi-track-editor-row.tsx'
import { Button } from '../design/buttons.tsx'
import { mediaQuery } from '../design/responsive.tsx'
import { FormatSelector } from './components/format-selector.tsx'

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
  const [currentFiles, setCurrentFiles] = useAtom(trackUploadsAtom)
  const [invalidFiles, setInvalidFiles] = useState<File[]>([])
  const { probeMetadata } = useProbeMetadata()

  useEffect(() => {
    if (currentFiles.length === 0) {
      return
    }

    const preventUnload = (e: BeforeUnloadEvent) => {
      if (!confirm('You have made changes. Do want to abandon them?')) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [currentFiles])

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
      setCurrentFiles([
        ...uploadedFiles.map((uploadedFile) => ({ uploadedFile })),
        ...currentFiles,
      ])
    },
    [currentFiles, probeMetadata, setCurrentFiles],
  )
  const invalidFileFormats = useMemo(
    () => [...new Set(invalidFiles.map((file) => getExtension(file.name)))],
    [invalidFiles],
  )

  const removeFile = useCallback(
    (fileToRemove: File) =>
      setCurrentFiles(
        currentFiles.filter(
          ({ uploadedFile }) => uploadedFile.file !== fileToRemove,
        ),
      ),
    [currentFiles, setCurrentFiles],
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

const TrackUploader = ({
  invalidFileFormats,
  onChange,
}: {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  invalidFileFormats: string[]
}) => (
  <>
    <Dropzone
      onChange={onChange}
      accept=".aif,.aiff,.wav,.mp3,.flac"
      multiple
      containerCss={css`
        padding: 2rem 1rem;
      `}
    >
      <DropzoneInstructions>
        <DropzoneInstructionsLeft>
          <ImportIcon css={[pushRightSm]} />
          <DropzoneText>Import a track</DropzoneText>
        </DropzoneInstructionsLeft>
        <DropzoneInstructionsRight>
          <DropzoneTextSm>Drop file or click to select</DropzoneTextSm>
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
  </>
)

export const TrackEditView: React.FC<FileUploadActions> = ({
  handleFilesAdded,
  currentFiles,
  invalidFileFormats,
}) => {
  const [editMode, setEditMode] = useState<EditMode>('single')
  const [multiFormat, setMultiFormat] = useAtom(multiFormatAtom)
  const downloadersRegistry = useAtomValue(downloadersRegistryAtom)
  const [downloadAllIsBusy, setDownloadAllIsBusy] = useState(false)

  const handleDownloadAll = useCallback(async () => {
    setDownloadAllIsBusy(true)
    const downloaders = [...downloadersRegistry]
    for (const download of downloaders) {
      await download()
    }
    setDownloadAllIsBusy(false)
  }, [downloadersRegistry])

  return (
    <MainOuterContainer>
      <MainInnerContainer>
        <h1 css={[pushBottom, pushTopXs]}>Styler tool</h1>

        <TrackUploader
          onChange={handleFilesAdded}
          invalidFileFormats={invalidFileFormats}
        />

        <div
          css={css`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            padding-top: 1rem;
          `}
        >
          <EditModeSelector
            editMode={editMode}
            onChange={(mode: EditMode) => {
              setEditMode(mode)
            }}
          />

          {isMultiMode(editMode) && currentFiles.length > 0 && (
            <div
              css={css`
                display: flex;
                align-items: center;
                gap: 1rem;
              `}
            >
              <FormatSelector
                onChange={(e) => setMultiFormat(e.target.value as Format)}
                value={multiFormat}
              />
              <Button onClick={handleDownloadAll} disabled={downloadAllIsBusy}>
                {!downloadAllIsBusy && <ExportIcon css={pushRightSm} />}
                {downloadAllIsBusy && <LoadingIcon css={[spin, pushRightSm]} />}
                Save all
              </Button>
            </div>
          )}
        </div>
      </MainInnerContainer>

      <MainInnerContainer
        maxWidth={isMultiMode(editMode) ? '100vw' : undefined}
        gutter={false}
      >
        <TrackEditors editMode={editMode}>
          {isMultiMode(editMode) && currentFiles.length > 0 && (
            <MultiEditorTable>
              <thead>
                <MultiEditorHeaderRow />
              </thead>
              <tbody>
                {currentFiles.map((fileSAndState, index) => (
                  <TrackEditor
                    key={fileSAndState.uploadedFile.id}
                    fileAndState={fileSAndState}
                    editMode={editMode}
                    isFirstRow={index === 0}
                  />
                ))}
              </tbody>
            </MultiEditorTable>
          )}

          {isSingleMode(editMode) &&
            currentFiles.map((fileSAndState) => (
              <TrackEditor
                key={fileSAndState.uploadedFile.id}
                fileAndState={fileSAndState}
                editMode={editMode}
              />
            ))}
        </TrackEditors>
      </MainInnerContainer>
    </MainOuterContainer>
  )
}

export const TrackEdit = () => {
  const uploadProps = useTrackUpload()
  return <TrackEditView {...uploadProps} />
}

const EditModeSelector = ({
  editMode,
  onChange,
}: {
  editMode: 'multi' | 'single'
  onChange: (mode: EditMode) => void
}) => (
  <div
    css={css`
      padding-top: 2rem;
    `}
  >
    <div
      css={css`
        font-family: var(--font-brand), sans-serif;
        font-size: 0.75rem;
        font-weight: 500;
        padding-bottom: 0.25rem;
      `}
    >
      Edit mode
    </div>
    <Selector formName="edit-mode">
      <SelectorOption
        checked={editMode === 'multi'}
        onChange={(e) => {
          if (e.target.checked) {
            onChange('multi')
          }
        }}
      >
        Multi
      </SelectorOption>
      <SelectorOption
        checked={editMode === 'single'}
        onChange={(e) => {
          if (e.target.checked) {
            onChange('single')
          }
        }}
      >
        Single
      </SelectorOption>
    </Selector>
  </div>
)

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

const TrackEditors = styled.div<WithEditMode>`
  ${(p) =>
    isSingleMode(p) &&
    css`
      display: flex;
      flex-direction: column;
      gap: 2rem;

      :not(:first-of-type) {
        padding-top: 2rem;
      }
    `}
  ${(p) =>
    isMultiMode(p) &&
    css`
      max-width: 100vw;
      padding: 0 1rem 1rem 1rem;
      overflow-x: auto;
      overflow-y: visible;

      ${mediaQuery.tabletUp`
        padding: 0 2rem 1rem 2rem;
      `}
    `}
`
