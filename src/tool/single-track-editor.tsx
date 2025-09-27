import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { makeFormHandler, TrackFormState, TrackState } from './state.ts'
import { useMemo } from 'react'
import { UploadedFile } from './index.tsx'
import { AlbumCoverUpload } from './album-cover-upload.tsx'
import { FormatSelector } from './components/format-selector.tsx'
import { Format } from '../ffmpeg.tsx'
import { FormatInfo } from './components/format-info.tsx'
import { Button } from '../design/buttons.tsx'
import { pushRightXs, spin } from '../design/style-utils.ts'
import ExportIcon from '../icons/export.svg?react'
import LoadingIcon from '../icons/loading.svg?react'
import { DropzoneText } from './dropzone.tsx'

export const SingleTrackEditor = ({
  trackState,
  uploadedFile,
  setTrackState,
  onDownload,
  trackConverter,
}: {
  trackState: TrackState
  uploadedFile: UploadedFile
  setTrackState: (trackState: Partial<TrackFormState>) => void
  onDownload: () => void
  trackConverter: {
    isReady: boolean
    isBusy: boolean
    convertTrack: () => Promise<undefined | Blob>
  }
}) => {
  const formHandler = useMemo(
    () => makeFormHandler(trackState, setTrackState),
    [setTrackState, trackState],
  )
  return (
    <TrackEditorContainer>
      <Headline>{uploadedFile.file.name}</Headline>
      <Form>
        <AlbumCoverUpload
          value={trackState.albumCover}
          setValue={(albumCoverFile) =>
            setTrackState({ albumCover: albumCoverFile })
          }
          defaultAlbumCover={uploadedFile.metadata?.albumCover}
        >
          <DropzoneText
            css={css`
              text-shadow: 0 0 5px #000000cc;
              opacity: 0.8;
            `}
          >
            Drop picture
          </DropzoneText>
        </AlbumCoverUpload>

        <TextFields>
          <InputGroup
            label="Track Title"
            placeholder="My Track (Original Mix)"
            required
            fieldSize="lg"
            style={{ marginBottom: '0.5rem' }}
            {...formHandler('title')}
          />
          <InputGroup
            label="Artist"
            placeholder="Artsy"
            required
            {...formHandler('artist')}
          />
          <InputGroup
            label="Record Label"
            placeholder="Awesome Records"
            {...formHandler('recordLabel')}
          />
          <InputGroup
            label="Album"
            placeholder="AR007"
            {...formHandler('album')}
          />
        </TextFields>
      </Form>

      <Actions>
        <PreviewContainer>
          {trackState.newFileName && (
            <Preview>
              {trackState.albumCoverUrl && (
                <AlbumCoverPreview
                  src={trackState.albumCoverUrl}
                  disabled={trackState.targetFormat === 'wav'}
                />
              )}
              <div>
                {trackState.newFileName}
                {trackState.sourceFormat === 'mp3' && <>.mp3</>}
                {trackState.sourceFormat !== 'mp3' && (
                  <FormatSelector
                    onChange={(e) =>
                      setTrackState({
                        selectedFormat: e.target.value as Format,
                      })
                    }
                    value={trackState.selectedFormat}
                  />
                )}
              </div>
            </Preview>
          )}
          <FormatInfo
            sourceFormat={trackState.sourceFormat}
            targetFormat={trackState.targetFormat}
            hasAlbumCover={!!trackState.albumCover}
          />
        </PreviewContainer>
        <Button
          onClick={onDownload}
          disabled={
            trackConverter.isBusy || !trackState.title || !trackState.artist
          }
        >
          {!trackConverter.isBusy && <ExportIcon css={pushRightXs} />}
          {trackConverter.isBusy && <LoadingIcon css={[pushRightXs, spin]} />}
          {trackState.targetFormat === trackState.sourceFormat && <>Save</>}
          {trackState.targetFormat !== trackState.sourceFormat && (
            <>Convert &amp; save</>
          )}
        </Button>
      </Actions>
    </TrackEditorContainer>
  )
}

const TrackEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: var(--border);
  border-radius: 0.25rem;
  padding: 1rem;
`

const Headline = styled.h2`
  font-size: 1.25rem;
  font-weight: normal;
`

const Form = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`

const TextFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`

type WithFieldSize = { fieldSize?: 'md' | 'lg' }

const InputGroup: React.FC<
  { label: React.ReactNode } & WithFieldSize &
    React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, fieldSize, ...inputProps }) => {
  return (
    <InputLabel>
      <span>
        {label}
        {!inputProps.required && <Optional>(optional)</Optional>}
      </span>
      <Input fieldSize={fieldSize} {...inputProps} />
    </InputLabel>
  )
}

const InputLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  width: 100%;

  span {
    font-size: 0.75rem;
  }
`

const Optional = styled.span`
  color: var(--color-text--muted);
  margin-left: 0.5ch;
`

const Input = styled.input<WithFieldSize>`
  width: 100%;
  background-color: var(--color-bg-interactive);
  border: var(--border);
  padding: 0.5rem;
  border-radius: 0.25rem;

  ${(p) =>
    p.fieldSize === 'lg' &&
    css`
      font-size: 1.5rem;
    `};

  ::placeholder {
    color: var(--color-text--muted);
    font-style: italic;
  }

  :focus,
  :focus-visible {
    outline: none;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Preview = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const AlbumCoverPreview = styled.img<{ disabled?: boolean }>`
  width: 2rem;
  height: 2rem;
  object-fit: cover;
  object-position: center;
  aspect-ratio: 1 / 1;

  ${(p) =>
    p.disabled &&
    css`
      opacity: 0.3;
    `}
`
