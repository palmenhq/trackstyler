import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useMemo, useState } from 'react'
import { Format, useTrackConvert } from '../ffmpeg'
import { FileTuple } from './index'
import { Dropzone, DropzoneText } from './dropzone'

const removeExtension = (fileName: string) => fileName.replace(/\.\w+$/, '')
const getExtension = (fileName: string) => fileName.replace(/^.*\./, '')
const guessFormatFromExtension = (fileName: string): Format => {
  const extension = getExtension(fileName)
  switch (extension) {
    case 'wav':
      return 'wav'
    case 'mp3':
      return 'mp3'
    case 'aif':
    case 'aiff':
      return 'aiff'
    default:
      throw new Error(`Unsupported file type "${extension}"`)
  }
}

const cleanString = (str: string) => str.replace(/[^\w\-_+()[\]:.<>\s]/g, '')

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
    newName += `  [${cleanRecordLabel}]`
  }
  const safeNewName = cleanString(newName).replace(/\s{2,}/g, ' ')
  return safeNewName
}

const autoDownloadTrack = (downloadName: string, file: Blob) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = downloadName
  a.style.width = '1px'
  a.style.height = '1px'
  a.style.opacity = '0'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const TrackEditor: React.FC<{ file: FileTuple }> = ({ file }) => {
  const [title, setTitle] = useState(() => removeExtension(file[1].name))
  const [artist, setArtist] = useState('')
  const [recordLabel, setRecordLabel] = useState('')
  const [album, setAlbum] = useState('')
  const [albumCover, setAlbumCover] = useState<File | null>(null)
  const [albumCoverValue, setAlbumCoverValue] = useState<string | undefined>(
    undefined,
  )
  const [format, setFormat] = useState<Format>(() =>
    guessFormatFromExtension(file[1].name),
  )
  const fallbackFormat = useMemo(
    () => guessFormatFromExtension(file[1].name),
    [file],
  )
  const targetFormat = format ?? fallbackFormat

  const cleanTitle = title.trim()
  const cleanArtist = artist.trim()
  const cleanRecordLabel = recordLabel.trim()
  const cleanAlbum = album.trim()

  const newFileName = useMemo(() => {
    if (!cleanTitle || !cleanArtist) {
      return removeExtension(file[1].name)
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
    sourceFormat: fallbackFormat,
    metadata: {
      title: cleanTitle,
      artist: cleanArtist,
      album: cleanAlbum,
      publisher: cleanRecordLabel,
      albumCover: albumCover,
    },
  })

  return (
    <TrackEditorContainer>
      <Headline>{file[1].name}</Headline>
      <Form>
        <AlbumCover>
          <Dropzone
            containerCss={css`
              width: 100%;
              ${!!albumCover &&
              css`
                background: url(${URL.createObjectURL(albumCover)});
                background-position: center center;
                background-size: cover;
                background-repeat: no-repeat;

                ::after {
                  content: ' ';
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: inherit;
                  background: #ffffff00;
                  transition: background 50ms;
                }

                :hover,
                :focus {
                  ::after {
                    background: #ffffff66;
                  }
                }
              `}
            `}
            onChange={(e) => {
              setAlbumCoverValue(e.target.value)
              setAlbumCover(e.target.files?.[0] ?? null)
            }}
            value={albumCoverValue}
            accept="image/*"
          >
            <DropzoneText
              css={css`
                text-shadow: 0 0 5px #000000cc;
                opacity: 0.8;
              `}
            >
              Drop picture
            </DropzoneText>
          </Dropzone>
        </AlbumCover>
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
      <select
        onChange={(e) => setFormat(e.target.value as Format)}
        value={format}
      >
        <option value="aiff">.aiff</option>
        <option value="wav">.wav</option>
        <option value="mp3">.mp3</option>
      </select>
      <Actions>
        {newFileName && `${newFileName}.${targetFormat}`}
        <Button
          onClick={(e) => {
            e.preventDefault()
            trackConverter.convertTrack().then((convertedTrackBlob) => {
              if (convertedTrackBlob) {
                autoDownloadTrack(newFileName!, convertedTrackBlob)
              }
            })
          }}
          disabled={trackConverter.isBusy}
        >
          Process file
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

const AlbumCover = styled.div`
  display: flex;
  width: 150px;
  height: 150px;
  aspect-ratio: 1 / 1;
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
`
