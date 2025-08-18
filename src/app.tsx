import { FC } from 'react'
import { TrackEdit } from './track-edit'
import { FfmpegProvider } from './ffmpeg'
import { Layout } from './design/layout.tsx'
import { About } from './about'

import './index.css'

export const App: FC<{ path: string }> = ({ path }) => {
  return (
    <FfmpegProvider>
      <Layout>
        {path === '/' && <About />}
        {path.startsWith('/tool') && <TrackEdit />}
      </Layout>
    </FfmpegProvider>
  )
}
