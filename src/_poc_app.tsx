import { FFmpeg } from '@ffmpeg/ffmpeg'
import { useEffect, useRef, useState } from 'react'
import { fetchFile } from '@ffmpeg/util'

const ffmpegWorkerBase = ''

export const App = () => {
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg())
  const ffmpeg = ffmpegRef.current
  const [file, setFile] = useState<File | null>(null)
  const [, setFileIsLoading] = useState(false)
  const [downloadLink, setDownloadLink] = useState<null | string>(null)

  useEffect(() => {
    if (!file || !ffmpeg) {
      return
    }

    Promise.resolve()
      .then(() => {
        if (!ffmpeg.loaded) {
          return ffmpeg.load({
            workerURL: `${ffmpegWorkerBase}/fmpc.worker.js`,
            coreURL: `${ffmpegWorkerBase}/fmpc.js`,
            wasmURL: `${ffmpegWorkerBase}/fmpc.wasm`,
            classWorkerURL: `${ffmpegWorkerBase}/fmp/worker.js`,
          })
        }
      })
      .then(async () => {
        console.log('loaded')
        ffmpeg.on('log', (d) => console.log(d))

        setFileIsLoading(true)
        console.debug(file.name, file.type)
        await ffmpeg.writeFile(file.name, await fetchFile(file))
        await ffmpeg.writeFile('/dogmeme.png', await fetchFile('/dogmeme.png'))
        const albumArtFile = `${file.name}__album_art.jpg`
        await ffmpeg.exec(
          [
            ['-i', '/dogmeme.png'],
            [
              '-vf',
              // Crop to square, then scale to 1000x1000 if it's > 1000:1000 px
              "crop='min(in_w\\,in_h)':'min(in_w\\,in_h)',scale='if(gt(in_w\\,1000),1000,in_w)':'if(gt(in_h\\,1000),1000,in_h)'",
            ],
            ['-q', '0.9'],
            albumArtFile,
          ].flat(),
        )
        const outFileName = 'out__' + file.name + '.mp3'
        await ffmpeg.exec(
          [
            ['-i', file.name],
            ['-i', albumArtFile],
            ['-map', '0:0'],
            ['-map', '1:0'],
            ['-id3v2_version', '3'],
            ['-metadata:s:v', 'title="Album cover"'],
            ['-metadata:s:v', 'comment="Cover (front)"'],
            ['-metadata', 'artist=Awesome Artist'],
            // for mp3
            ['-b:a', '320k'],
            ['-write_id3v2', '1'],
            // for keeping original sound
            // ['-codec:a', 'copy'],
            ['-codec:v', 'copy'],
            outFileName,
          ].flat(),
        )
        console.log('orig', (await ffmpeg.readFile(file.name)).length / 1024)
        console.log('dest', (await ffmpeg.readFile(outFileName)).length / 1024)

        setDownloadLink(
          URL.createObjectURL(
            new Blob([await ffmpeg.readFile(outFileName)], {
              type: 'audio/mpeg',
            }),
          ),
        )
        // await ffmpeg.readFile('myfile').finally(() => setFileIsLoading(false))
      })
      .catch((err) => console.error(err))
  }, [file, ffmpeg])

  return (
    <div>
      <h1>Style a track</h1>
      <label>
        Select file{' '}
        <input
          type="file"
          onChange={(e) => {
            const upload = e.target.files?.[0]
            if (upload) {
              setFile(upload)
            }
          }}
        />
      </label>
      {downloadLink && (
        <a href={downloadLink} download="aoeu.mp3">
          Download :)
        </a>
      )}
    </div>
  )
}
