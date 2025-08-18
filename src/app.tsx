import { TrackEdit } from './track-edit'
import { FfmpegProvider } from './ffmpeg'
import { Layout } from './design/layout.tsx'
import { FC } from 'react'

import './index.css'

export const App: FC<{ path: string }> = ({ path }) => {
  return (
    <FfmpegProvider>
      <Layout>
        {path === '/' && null}
        {path.startsWith('/about') && null}
        {path.startsWith('/tool') && <TrackEdit />}
      </Layout>
    </FfmpegProvider>
  )
}
