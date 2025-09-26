import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { ChangeEventHandler, useId } from 'react'
import { Format } from '../../ffmpeg.tsx'
import ChevronIcon from '../../icons/chevron.svg?react'

export const FormatSelector = ({
  onChange,
  value,
}: {
  onChange: ChangeEventHandler<HTMLSelectElement>
  value: Format
}) => {
  const id = useId()

  return (
    <FormatSelectContainer htmlFor={id}>
      <FormatSelect onChange={onChange} value={value} id={id}>
        <option value="aiff">.aiff</option>
        <option value="wav">.wav</option>
        <option value="flac">.flac</option>
        <option value="mp3">.mp3</option>
      </FormatSelect>
      <ChevronIcon
        css={css`
          z-index: -1;
        `}
      />
    </FormatSelectContainer>
  )
}

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
