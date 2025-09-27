import { Dropzone } from './dropzone'
import { css, SerializedStyles } from '@emotion/react'
import styled from '@emotion/styled'
import { PropsWithChildren, useMemo, useState } from 'react'

export const AlbumCoverUpload = ({
  setValue,
  value,
  defaultAlbumCover,
  className,
  containerCss,
  children,
}: PropsWithChildren<{
  value?: File | null
  setValue?: (value: File | null) => void
  defaultAlbumCover?: File | null
  className?: string
  containerCss?: SerializedStyles
}>) => {
  const [albumCoverValue, setAlbumCoverValue] = useState<string | undefined>()

  const albumCoverUrl = useMemo(() => {
    const albumCoverWithDefault = value ?? defaultAlbumCover
    return albumCoverWithDefault
      ? URL.createObjectURL(albumCoverWithDefault)
      : null
  }, [defaultAlbumCover, value])

  return (
    <AlbumCover className={className} css={containerCss}>
      <Dropzone
        containerCss={css`
          width: 100%;
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
        containerStyle={
          albumCoverUrl
            ? {
                backgroundImage: `url(${albumCoverUrl})`,
              }
            : undefined
        }
        onChange={(e) => {
          setAlbumCoverValue(e.target.value)
          setValue?.(e.target.files?.[0] ?? null)
        }}
        value={albumCoverValue}
        accept="image/*"
      >
        {children}
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
