import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { useState } from 'react'
import { fontHeadline, fontNormal } from '../design/style-utils'

export const Dropzone: React.FC<{
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  value?: string | string[]
  accept?: string
}> = ({ value, onChange, accept }) => {
  const [dragIsActive, setDragIsActive] = useState(false)

  return (
    <DropzoneContainer
      onDragOver={() => {
        setDragIsActive(true)
      }}
      onDragLeave={() => {
        setDragIsActive(false)
      }}
      onDrop={() => {
        setDragIsActive(false)
      }}
      dragIsActive={dragIsActive}
    >
      <DropzoneText>Drop a track</DropzoneText>
      <DropzoneTextSm>or click to select an audio file</DropzoneTextSm>
      <DropzoneTextSmMuted>
        <em>Supported formats: .wav, .aiff, .mp3</em>
      </DropzoneTextSmMuted>
      <input
        type="file"
        onChange={onChange}
        value={value}
        accept={accept}
        multiple
      />
    </DropzoneContainer>
  )
}

const DropzoneContainer = styled.label<{ dragIsActive?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  position: relative;

  border-radius: 4px;
  padding: 2rem;
  border: var(--border);
  cursor: pointer;
  background-color: var(--color-bg-interactive);
  transition:
    background-color 50ms,
    border 50ms;

  ${(p) =>
    p.dragIsActive &&
    css`
      background-color: var(--color-bg-interactive--active);
      border-color: var(--color-border--bright);
    `};

  input {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 0;
  }

  ::before {
    content: ' ';
    display: block;
    position: absolute;
    pointer-events: none;
    border: 2px dashed var(--color-border);
    border-radius: 0.25rem;
    top: 0.25rem;
    right: 0.25rem;
    bottom: 0.25rem;
    left: 0.25rem;
  }
`
const DropzoneText = styled.span`
  ${fontHeadline};
  font-size: 1.25rem;
  text-align: center;
`
const DropzoneTextSm = styled(DropzoneText)`
  ${fontNormal};
  font-size: 1rem;
  font-size: 0.75rem;
`
const DropzoneTextSmMuted = styled(DropzoneTextSm)`
  color: var(--color-text--muted);
`
