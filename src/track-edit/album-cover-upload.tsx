import { Dropzone, DropzoneText } from './dropzone'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { useMemo, useState } from 'react'

export const AlbumCoverUpload = ({
  setValue,
  value,
}: {
  value?: File | null
  setValue?: (value: File | null) => void
}) => {
  const [albumCoverValue, setAlbumCoverValue] = useState<string | undefined>()

  const albumCoverUrl = useMemo(
    () => value && URL.createObjectURL(value),
    [value],
  )

  return (
    <AlbumCover>
      <Dropzone
        containerCss={css`
          width: 100%;
          ${!!value &&
          css`
            background: url(${albumCoverUrl});
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
            :focus,
            :active {
              ::after {
                background: #ffffff33;
              }
            }
          `}
        `}
        onChange={(e) => {
          setAlbumCoverValue(e.target.value)
          setValue?.(e.target.files?.[0] ?? null)
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
  )
}

const AlbumCover = styled.div`
  display: flex;
  width: 150px;
  height: 150px;
  aspect-ratio: 1 / 1;
`
