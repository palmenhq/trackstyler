import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { ButtonLink } from '../design/buttons.tsx'
import { MainContainer, MainInnerContainer } from '../design/layout'

export const About = () => {
  return (
    <AboutContainer>
      <Banner>
        <BannerContentContainer>
          <BannerContent>
            <h2>First impressions matter</h2>
            <h1
              css={css`
                color: var(--color-brand-green);
                font-weight: 600;
                font-size: 2.5rem;
              `}
            >
              Style your tracks
            </h1>
            <p
              css={css`
                margin: 0;
              `}
            >
              Make your music stand out. If you share audio files, styling is a
              must.
            </p>
          </BannerContent>
          <ButtonLink href="/tool">Use Styler tool</ButtonLink>
        </BannerContentContainer>
        <BannerImage src="/banner.jpg" />
      </Banner>

      <MainContainer>
        <Section>
          <SectionH3>Make your music stand out</SectionH3>
          <BrandH2>Prep your files for the world</BrandH2>
          <p>
            Let’s face it — most people will judge a track by its cover. As an
            indie music producer or label, you should give your tracks a fair
            chance. With Trackstyler, you can give a pro look to the tracks you
            send - to give your music a fair chance. Your tracks will show up
            like any other store-bought track in the listener's player.
          </p>
        </Section>

        <Section>
          <SectionH3>Player-ready files</SectionH3>
          <BrandH2>
            No more{' '}
            <code
              css={css`
                color: var(--color-text);
                border: 1px solid var(--color-brand-green);
                padding: 0 0.5ch;
                border-radius: 0.25rem;
                font-size: 0.75em;
              `}
            >
              final master 2.wav
            </code>
          </BrandH2>
          <p>
            Trackstyler lets you add track info, and attaches the metadata -
            such as album cover and title - to your audio file. Regardless if
            you share download-enabled private Soundcloud links, on free
            downloads on Hypeddit, or simply email your audio files, your can
            finally make your tracks stand out.
          </p>
        </Section>

        <Section>
          <SectionH3>Your tracks stays with you</SectionH3>
          <BrandH2>Private by default</BrandH2>
          <p>
            When processing your track, it happens on your machine. It never
            leaves your computer - so you’re in full control of its
            distribution.
          </p>
          <p>
            How it works? Trackstyler is a UI tool built on top of{' '}
            <a
              href="https://github.com/ffmpegwasm/ffmpeg.wasm"
              target="_blank"
              rel="noopener"
            >
              ffmpeg.wasm
            </a>{' '}
            - a browser version of a strongly established, and technically
            advanced, media management tool.
          </p>
        </Section>

        <Section>
          <SectionH3>No subscriptions, no fees</SectionH3>
          <BrandH2>Completely free</BrandH2>
          <p>
            Yes, you read it right. Trackstyler is completely free to use - with
            no fees and no subscriptions. Why? I'm myself a DJ and producer, who
            simply grew sick of ugly audio files. I'm hoping this tool will
            reach my favorite artists and help us all.
          </p>

          <p>
            It's possible because Trackstyler is not too expensive to run - your
            machine handles the actual processing, which is what would otherwise
            would make it too pricey to share completely free.
          </p>

          <p>
            If you like it - please consider supporting my artistic journey on{' '}
            <a
              href="https://instagram.com/yohan.aif"
              target="_blank"
              rel="noopener"
            >
              Instagram
            </a>{' '}
            or any music streaming platform - eg.{' '}
            <a
              href="https://soundcloud.com/yohandotaif"
              target="_blank"
              rel="noopener"
            >
              SoundCloud
            </a>
            .
          </p>
        </Section>
      </MainContainer>
    </AboutContainer>
  )
}

const AboutContainer = styled.div`
  min-height: 100%;
`
const Banner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 25rem;
  margin: -1rem 0 0 0;
  position: relative;
  overflow: hidden;
`

const BannerContentContainer = styled(MainInnerContainer)`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`

const BannerContent = styled.div`
  padding: 1rem;
  border: 1px solid var(--color-border);
  background: #9999990c;
  backdrop-filter: blur(8px);
  border-radius: 0.25rem;
`

const BannerImage = styled.img`
  position: absolute;
  height: auto;
  min-height: 100%;
  min-width: calc(100% + 10rem);
  object-fit: cover;
  top: 50%;
  bottom: -50%;
  left: calc(50% - 5rem);
  transform: translateX(-50%) translateY(-50%);
  z-index: -1;
`

const Section = styled.section`
  :not(:last-of-type) {
    padding-bottom: 4rem;
  }
`

const SectionH3 = styled.h3`
  font-size: 1.5;
`

const BrandH2 = styled.h2`
  color: var(--color-brand-green);
  font-weight: 600;
  font-size: 2rem;
`
