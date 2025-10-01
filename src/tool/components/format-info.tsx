import { FC, useMemo } from 'react'
import InfoIconSvg from '../../icons/info.svg?react'
import { Format } from '../../ffmpeg.tsx'
import styled from '@emotion/styled'

const useHintTexts = ({
  sourceFormat,
  targetFormat,
  hasAlbumCover,
}: {
  sourceFormat: 'aiff' | 'wav' | 'flac' | 'mp3'
  targetFormat: 'aiff' | 'wav' | 'flac' | 'mp3'
  hasAlbumCover: boolean
}) => {
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
  return formatInfoHint
}

type FormatInfoProps = {
  sourceFormat: Format
  targetFormat: Format
  hasAlbumCover: boolean
}
export const FormatInfo: FC<FormatInfoProps> = ({
  sourceFormat,
  targetFormat,
  hasAlbumCover,
}) => {
  const formatInfoHints = useHintTexts({
    sourceFormat,
    targetFormat,
    hasAlbumCover,
  })

  return (
    <>
      {formatInfoHints.length > 0 && (
        <FormatInfoBox>
          <InfoIcon />
          <FormatInfoText>{formatInfoHints.join(' ')}</FormatInfoText>
        </FormatInfoBox>
      )}
    </>
  )
}

const InfoIcon = styled(InfoIconSvg)`
  margin-top: 0.2rem;
  fill: var(--color-info);
  flex-shrink: 0;
`

const FormatInfoText = styled.div``

const FormatInfoBox = styled.div`
  display: flex;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  max-width: 21rem;
`

export const FormatInfoPopover: FC<FormatInfoProps> = ({
  sourceFormat,
  targetFormat,
  hasAlbumCover,
}) => {
  const formatInfoHints = useHintTexts({
    sourceFormat,
    targetFormat,
    hasAlbumCover,
  })

  return (
    <>
      {formatInfoHints.length > 0 && (
        <Popover>
          <InfoIcon />
          <FormatInfoText>{formatInfoHints.join(' ')}</FormatInfoText>
        </Popover>
      )}
    </>
  )
}

const Popover = styled.div`
  position: relative;
  ${FormatInfoText} {
    display: none;
  }

  ${InfoIcon}:hover + ${FormatInfoText} {
    display: flex;
    position: absolute;
    right: calc(100% + 1rem);
    top: 50%;
    transform: translateY(-50%);
    width: 20rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    padding: 1rem;
    box-shadow: 0 0 1rem #000000aa;
    white-space: normal;
    z-index: 99;
  }
`
