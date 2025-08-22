import styled from '@emotion/styled'
import { useState } from 'react'
import { fontHeadline, fontNormal } from '../design/style-utils'
import { css, Interpolation } from '@emotion/react'

export const Dropzone: React.FC<{
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  value?: string | string[]
  accept?: string
  children?: React.ReactNode
  containerCss?: Interpolation
  multiple?: boolean
}> = ({
  value,
  onChange,
  accept,
  children,
  containerCss,
  multiple = false,
}) => {
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
      css={containerCss}
    >
      {children}

      <input
        type="file"
        onChange={onChange}
        value={value}
        accept={accept}
        multiple={multiple}
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
export const DropzoneText = styled.span`
  ${fontHeadline};
  font-size: 1.25rem;
  text-align: center;
`
export const DropzoneTextSm = styled(DropzoneText)`
  ${fontNormal};
  font-size: 1rem;
  font-size: 0.75rem;
`
export const DropzoneTextSmMuted = styled(DropzoneTextSm)`
  color: var(--color-text--muted);
`
