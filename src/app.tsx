import { TrackEdit } from './track-edit'
import { FfmpegProvider } from './ffmpeg'

export const App = () => {
  return (
    <FfmpegProvider>
      <>
        <TrackEdit />
      </>
    </FfmpegProvider>
  )
}
