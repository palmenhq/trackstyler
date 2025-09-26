import { FC, useMemo } from 'react'
import InfoIcon from '../../icons/info.svg?react'
import { Format } from '../../ffmpeg.tsx'
import styled from '@emotion/styled'

export const FormatInfo: FC<{
  sourceFormat: Format
  targetFormat: Format
  hasAlbumCover: boolean
}> = ({ sourceFormat, targetFormat, hasAlbumCover }) => {
  const formatInfoHint = useMemo(() => {
    const errors = []
    if (sourceFormat === 'mp3') {
      errors.push(
        '.mp3 is a lossy compressed format and cannot be converted to uncompressed formats like .wav or .aiff.',
      )
    }

    if (
      sourceFormat === 'flac' &&
      (targetFormat === 'aiff' || targetFormat === 'wav')
    ) {
      errors.push(
        `When converting .flac to .${targetFormat}, a small performance loss might occur.`,
      )
    }

    if (targetFormat === 'flac') {
      errors.push('Playback support .flac is limited on some devices.')
    }

    if (targetFormat === 'flac' && hasAlbumCover) {
      errors.push('Album cover might not be shown everywhere.')
    }

    if (targetFormat === 'wav' && hasAlbumCover) {
      errors.push(
        '.wav does not support embedded album covers. Choose .aiff to include the album cover.',
      )
    }

    return errors
  }, [hasAlbumCover, sourceFormat, targetFormat])

  return (
    <>
      {formatInfoHint.length > 0 && (
        <FormatInfoBubble>
          <InfoIcon />
          <div>{formatInfoHint.join(' ')}</div>
        </FormatInfoBubble>
      )}
    </>
  )
}

const FormatInfoBubble = styled.div`
  display: flex;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  max-width: 21rem;

  svg {
    margin-top: 0.2rem;
    fill: var(--color-info);
    flex-shrink: 0;
  }
`
