import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useId, useMemo, useState } from 'react'
import { Format, useTrackConvert } from '../ffmpeg'
import { UploadedFile } from './index'
import Chevron from '../icons/chevron.svg?react'
import {
  cleanString,
  guessFormatFromExtension,
  removeExtension,
  triggerDownload,
} from '../util/file-helpers'
import { AlbumCoverUpload } from './album-cover-upload'

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

export const TrackEditor: React.FC<{ file: UploadedFile }> = ({ file }) => {
  const [title, setTitle] = useState(
    () => file.metadata?.title ?? removeExtension(file.file.name),
  )
  const [artist, setArtist] = useState(file.metadata?.artist ?? '')
  const [recordLabel, setRecordLabel] = useState(file.metadata?.publisher ?? '')
  const [album, setAlbum] = useState(file.metadata?.album ?? '')
  const [albumCover, setAlbumCover] = useState<File | null>(
    file.metadata?.albumCover ?? null,
  )
  const [format, setFormat] = useState<Format>(() =>
    guessFormatFromExtension(file.file.name),
  )
  const sourceFormat = useMemo(
    () => guessFormatFromExtension(file.file.name),
    [file],
  )
  const targetFormat = format ?? sourceFormat

  const cleanTitle = title.trim()
  const cleanArtist = artist.trim()
  const cleanRecordLabel = recordLabel.trim()
  const cleanAlbum = album.trim()

  const newFileName = useMemo(() => {
    if (!cleanTitle || !cleanArtist) {
      return removeExtension(file.file.name)
    }

    return serializeFileName({
      title: cleanTitle,
      artist: cleanArtist,
      recordLabel: cleanRecordLabel,
    })
  }, [cleanTitle, cleanArtist, cleanRecordLabel, file])

  const trackConverter = useTrackConvert({
    file,
    targetFormat,
    sourceFormat: sourceFormat,
    metadata: {
      title: cleanTitle,
      artist: cleanArtist,
      album: cleanAlbum,
      publisher: cleanRecordLabel,
      albumCover: albumCover,
    },
  })

  const formatId = useId()
  const albumCoverUrl = useMemo(() => {
    const coverWithDefault = albumCover ?? file.metadata?.albumCover
    if (coverWithDefault) {
      return URL.createObjectURL(coverWithDefault)
    } else {
      return null
    }
  }, [albumCover, file.metadata?.albumCover])

  return (
    <TrackEditorContainer>
      <Headline>{file.file.name}</Headline>
      <Form>
        <AlbumCoverUpload
          value={albumCover}
          setValue={setAlbumCover}
          defaultAlbumCover={file.metadata?.albumCover}
        />

        <TextFields>
          <InputGroup
            label="Track Title"
            placeholder="My Track (Original Mix)"
            required
            fieldSize="lg"
            style={{ marginBottom: '0.5rem' }}
            {...makeFormHandler(title, setTitle)}
          />
          <InputGroup
            label="Artist"
            placeholder="Artsy"
            required
            {...makeFormHandler(artist, setArtist)}
          />
          <InputGroup
            label="Record Label"
            placeholder="Awesome Records"
            {...makeFormHandler(recordLabel, setRecordLabel)}
          />
          <InputGroup
            label="Album"
            placeholder="AR007"
            {...makeFormHandler(album, setAlbum)}
          />
        </TextFields>
      </Form>
      <Actions>
        <div>
          {newFileName && (
            <Preview>
              {albumCoverUrl && (
                <AlbumCoverPreview
                  src={albumCoverUrl}
                  disabled={targetFormat === 'wav'}
                  title={
                    targetFormat === 'wav'
                      ? 'Album art is not supported in .wav files'
                      : undefined
                  }
                />
              )}
              <div>
                {newFileName}
                {sourceFormat === 'mp3' && (
                  <span title="MP3 is a compressed format and cannot be converted to uncompressed formats">
                    .mp3
                  </span>
                )}
                {sourceFormat !== 'mp3' && (
                  <FormatSelectContainer htmlFor={formatId}>
                    <FormatSelect
                      onChange={(e) => setFormat(e.target.value as Format)}
                      value={format}
                      id={formatId}
                    >
                      <option value="aiff">.aiff</option>
                      <option value="wav">.wav</option>
                      <option value="flac">.flac</option>
                      <option value="mp3">.mp3</option>
                    </FormatSelect>
                    <Chevron
                      css={css`
                        z-index: -1;
                      `}
                    />
                  </FormatSelectContainer>
                )}
              </div>
            </Preview>
          )}
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault()
            trackConverter.convertTrack().then((convertedTrackBlob) => {
              if (convertedTrackBlob) {
                triggerDownload(newFileName!, convertedTrackBlob)
              }
            })
          }}
          disabled={trackConverter.isBusy || !title || !artist}
        >
          {targetFormat === sourceFormat && <>Save</>}
          {targetFormat !== sourceFormat && <>Convert &amp; save</>}
          {trackConverter.isBusy && <> (Loading)</>}
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

const makeFormHandler = (value: string, setter: (val: string) => void) => ({
  value,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value),
})

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

const FormatSelectContainer = styled.label`
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  cursor: pointer;

  svg {
    position: absolute;
    top: 50%;
    right: 0.25rem;
    transform: translateY(-50%);
    width: 0.75rem;
    height: 0.75rem;
    fill: currentColor;
    flex-shrink: 0;
  }
`

const FormatSelect = styled.select`
  appearance: none;
  padding: 0.25rem 1.5rem 0.25rem 0.25rem;
  border: 0;
  font: inherit;
  background: transparent;
  color: var(--color-text);
  flex: 1;
  cursor: pointer;
`

const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font: inherit;
  color: var(--color-bg);
  background: var(--color-brand-green);
  border: 1px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  transition: background-color 50ms;

  :hover,
  :focus {
    background: var(--color-brand-green--light);
  }

  :disabled {
    cursor: default;
    background: var(--color-text--muted);
  }
`
