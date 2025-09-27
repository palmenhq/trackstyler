import {
  downloadersRegistryAtom,
  FileAndState,
  makeFormHandler,
  multiFormatAtom,
  TrackFormState,
  TrackState,
  useTrackEditorState,
} from './state.ts'
import styled from '@emotion/styled'
import { AlbumCoverUpload } from './album-cover-upload.tsx'
import { css } from '@emotion/react'
import ImportIcon from '../icons/import.svg?react'
import ExportIcon from '../icons/export.svg?react'
import LoadingIcon from '../icons/loading.svg?react'
import PenIcon from '../icons/pen.svg?react'
import { mediaQuery } from '../design/responsive.tsx'
import { Button } from '../design/buttons.tsx'
import { pushRightSm, pushRightXs, spin } from '../design/style-utils.ts'
import { useAtomValue } from 'jotai'
import { FormatInfo } from './components/format-info.tsx'
import { useEffect, useMemo, useRef, useState } from 'react'

interface MultiTrackEditorRowProps {
  fileAndState: FileAndState
  onDownload: () => Promise<void>
  trackConverter: {
    isReady: boolean
    isBusy: boolean
    convertTrack: () => Promise<undefined | Blob>
  }
  isFirstRow?: boolean
}

export const MultiTrackEditorRow = ({
  fileAndState,
  onDownload,
  trackConverter,
  isFirstRow,
}: MultiTrackEditorRowProps) => {
  const [trackState, setTrackState] = useTrackEditorState(fileAndState)
  const multiFormat = useAtomValue(multiFormatAtom)
  const downloadsRegistry = useAtomValue(downloadersRegistryAtom)

  useEffect(() => {
    downloadsRegistry.add(onDownload)

    return () => {
      downloadsRegistry.delete(onDownload)
    }
  }, [onDownload])

  return (
    <Row>
      <Cell
        css={css`
          padding: 0.5rem;
        `}
      >
        <AlbumCoverUpload
          value={trackState?.albumCover}
          setValue={(albumCoverFile) =>
            setTrackState({ albumCover: albumCoverFile })
          }
          defaultAlbumCover={fileAndState.uploadedFile.metadata?.albumCover}
          css={css`
            max-width: 3rem;
            max-height: 3rem;
          `}
        >
          <ImportIcon />
        </AlbumCoverUpload>
      </Cell>
      <Cell
        withPadding
        maxWidth="15rem"
        title={fileAndState.uploadedFile.file.name}
      >
        {fileAndState.uploadedFile.file.name}
      </Cell>
      <EditableCell
        formKey="title"
        placeholder="Title"
        tabIndex={isFirstRow ? 1 : undefined}
        trackState={trackState}
        setTrackState={setTrackState}
        minWidth="20rem"
      />
      <EditableCell
        formKey="artist"
        placeholder="Artist"
        trackState={trackState}
        setTrackState={setTrackState}
        minWidth="15rem"
      />
      <EditableCell
        formKey="recordLabel"
        placeholder="Record Label"
        trackState={trackState}
        setTrackState={setTrackState}
        minWidth="15rem"
      />
      <EditableCell
        formKey="album"
        placeholder="Album"
        trackState={trackState}
        setTrackState={setTrackState}
        minWidth="15rem"
      />
      <Cell withPadding>
        <Actions>
          <Button
            css={css`
              font-size: 0.75rem;
              padding: 0.25rem 0.5rem;
            `}
            onClick={onDownload}
            disabled={trackConverter.isBusy}
          >
            {!trackConverter.isBusy && <ExportIcon css={pushRightSm} />}
            {trackConverter.isBusy && <LoadingIcon css={[pushRightXs, spin]} />}
            {multiFormat === trackState?.sourceFormat && <>Download</>}
            {multiFormat !== trackState?.sourceFormat && (
              <>Convert & Download</>
            )}
          </Button>
          {trackState && (
            <FormatInfo
              sourceFormat={trackState.sourceFormat}
              targetFormat={multiFormat}
              hasAlbumCover={!!trackState.albumCover}
            />
          )}
        </Actions>
      </Cell>
    </Row>
  )
}

export const MultiEditorHeaderRow = () => {
  return (
    <Row>
      <Cell withPadding>Art</Cell>
      <Cell withPadding>File</Cell>
      <Cell withPadding>Title</Cell>
      <Cell withPadding>Artist</Cell>
      <Cell withPadding>Record Label</Cell>
      <Cell withPadding>Album</Cell>
      <Cell withPadding>Actions</Cell>
    </Row>
  )
}

const EditableCell = ({
  formKey,
  placeholder,
  tabIndex,
  trackState,
  setTrackState,
  minWidth,
}: {
  formKey: keyof Omit<TrackFormState, 'albumCover'>
  placeholder?: string
  tabIndex?: number | undefined
  trackState: TrackState
  setTrackState: (trackState: Partial<TrackFormState>) => void
  minWidth?: string
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formHandler = useMemo(
    () => makeFormHandler(trackState, setTrackState),
    [setTrackState, trackState],
  )

  return (
    <Cell isFocused={isFocused} minWidth={minWidth}>
      <Input
        placeholder={placeholder}
        tabIndex={tabIndex}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        ref={inputRef}
        {...formHandler(formKey)}
      />
      <EditIcon onClick={() => inputRef.current?.focus()} />
    </Cell>
  )
}

export const MultiEditorTable = styled.table`
  border-spacing: 0;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border);
  table-layout: fixed;

  min-width: calc(100vw - 2rem);

  ${mediaQuery.tabletUp`
    min-width: calc(100vw - 4rem);
  `}
`

const Cell = styled.td<{
  maxWidth?: string
  minWidth?: string
  withPadding?: boolean
  isEditable?: boolean
  isFocused?: boolean
}>`
  position: relative;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid transparent;

  ${(p) =>
    p.withPadding
      ? css`
          padding: 1rem;
        `
      : css`
          padding: 0;
        `}

  ${(p) =>
    p.maxWidth &&
    css`
      max-width: ${p.maxWidth};
    `};
  ${(p) =>
    p.minWidth &&
    css`
      min-width: ${p.minWidth};
    `};

  ${(p) =>
    !p.isFocused &&
    css`
      border-top-color: var(--color-border);

      thead & {
        border-top-color: transparent;
      }

      :not(:first-of-type) {
        border-left-color: var(--color-border);
      }
    `}

  ${(p) =>
    p.isFocused &&
    css`
      border-color: var(--color-info);
    `}
`

const Row = styled.tr`
  display: table-row;
`

const Input = styled.input`
  background: transparent;
  font: inherit;
  padding: 1rem;
  width: 100%;
  height: 100%;
  border: 0;

  ::placeholder {
    font-style: italic;
  }

  :focus,
  :focus-visible {
    outline: none;
  }
`

const StyledPenIcon = styled(PenIcon)`
  fill: var(--color-text--muted);
  position: absolute;
  right: 1rem;
  bottom: 1.25rem;
  width: 1em;
  height: 1em;
  cursor: pointer;
  pointer-events: auto;
`

const EditIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      css={css`
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        width: 7rem;
        background: linear-gradient(
          90deg,
          var(--color-bg--fully-transparent),
          var(--color-bg)
        );
        pointer-events: none;
        transition: opacity 100ms;

        input:focus-visible + & {
          opacity: 0;
        }
      `}
    >
      <StyledPenIcon onClick={onClick} />
    </div>
  )
}

const Actions = styled.div`
  white-space: normal;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`
