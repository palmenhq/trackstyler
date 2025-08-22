import Plausible from 'plausible-tracker'

export const plausible = Plausible({
  domain: 'trackstyler.com',
})

export const trackLoadedTrack = (props: { sourceFormat: string }) => {
  plausible.trackEvent('track_loaded', { props })
}
export const trackProbedTrack = (props: {
  title: boolean
  artist: boolean
  album: boolean
  albumCover: boolean
  recordLabel: boolean
}) => {
  plausible.trackEvent('track_probed', { props })
}

export const trackSavedTrack = (props: {
  sourceFormat: string
  targetFormat: string
  filledTitle: boolean
  filledArtist: boolean
  filledAlbum: boolean
  filledAlbumCover: boolean
  filledRecordLabel: boolean
  saveTime_ms: number
}) => {
  plausible.trackEvent('track_saved', { props })
}
