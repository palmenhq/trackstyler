import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { useMemo, useState } from 'react'

const removeExtension = (fileName: string) => fileName.replace(/\.\w+$/, '')
const getExtension = (fileName: string) => fileName.replace(/^.*\./, '')

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

export const TrackEditor: React.FC<{ file: File }> = ({ file }) => {
  const [title, setTitle] = useState(() => removeExtension(file.name))
  const [artist, setArtist] = useState('')
  const [recordLabel, setRecordLabel] = useState('')
  const [album, setAlbum] = useState('')

  const cleanTitle = title.trim()
  const cleanArtist = artist.trim()
  const cleanRecordLabel = recordLabel.trim()
  const cleanAlbum = album.trim()

  const newFileName = useMemo(() => {
    if (!cleanTitle || !cleanArtist) {
      return null
    }
    return serializeFileName({
      title: cleanTitle,
      artist: cleanArtist,
      recordLabel: cleanRecordLabel,
    })
  }, [cleanTitle, cleanArtist, cleanRecordLabel])

  return (
    <TrackEditorContainer>
      <Headline>{file.name}</Headline>
      <Form>
        <AlbumCover>pic</AlbumCover>
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
        {newFileName && `${newFileName}.${getExtension(file.name)}`}
        <Button>Process file</Button>
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
  width: 150px;
  height: 150px;
  background-color: var(--color-bg-interactive);
  padding: 1rem;
  border-radius: 0.25rem;
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
