import { FC, PropsWithChildren } from 'react'
import styled from '@emotion/styled'
import { useLocationPathName } from '../util/use-location-path-name.ts'
import { css } from '@emotion/react'
import { hiddenMobile, mediaQuery, screenSizes } from './responsive'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const path = useLocationPathName()
  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo href="/">
            <span>track</span>styler
          </Logo>

          <HeaderMenu>
            <MenuItem href="/" isActive={path === '/'} css={hiddenMobile}>
              About Trackstyler
            </MenuItem>
            <MenuItem href="/tool/" isActive={path.startsWith('/tool')}>
              Styler tool
            </MenuItem>
          </HeaderMenu>
        </HeaderContent>
      </Header>
      <MainSlot>{children}</MainSlot>
      <LicenceContainer>
        <Licence>
          <p>&copy; Yohan.Aif / Palmenhq AB {currentYear}</p>
          <p>
            Trackstyler is provided for free, as-is, without warranties of any
            kind, under the{' '}
            <a
              href="https://en.wikipedia.org/wiki/MIT_License"
              target="_blank"
              rel="noopener"
            >
              MIT license
            </a>
            .
          </p>
        </Licence>
      </LicenceContainer>
    </LayoutContainer>
  )
}

const currentYear = new Date().getFullYear()

const maxWidth = css`
  width: 100%;
  max-width: 70rem;
`

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  gap: 1rem;
`
export const MainOuterContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const MainInnerContainer = styled.div`
  padding: 1rem;
  ${maxWidth};

  ${mediaQuery.tabletUp`
    padding: 2rem;
  `};
`

export const MainContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <MainOuterContainer>
      <MainInnerContainer>{children}</MainInnerContainer>
    </MainOuterContainer>
  )
}

const Header = styled.div`
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  display: flex;
  justify-content: center;
`
const HeaderContent = styled(MainInnerContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const HeaderMenu = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`

const MenuItem = styled.a<{ isActive?: boolean }>`
  text-decoration: none;
  color: var(--color-text);
  position: relative;

  @media (${screenSizes.tabletUp}) {
    ::before {
      content: ' ';
      border-radius: 999px;
      background: var(--color-brand-green);
      width: 0.4em;
      height: 0.4em;
      position: absolute;
      left: 50%;
      bottom: -0.75em;
      opacity: ${(p) => (p.isActive ? '1' : '0')};
      transform: translateY(-50%);
      transition: opacity 50ms;
    }

    :hover::before,
    :focus::before {
      opacity: 1;
    }

    :hover,
    :focus {
      color: var(--color-text);
    }

    :not(:first-of-type) {
      border-left: 1px solid var(--color-border);
      padding-left: 1rem;
    }
  }
`

const MainSlot = styled.main`
  width: 100%;
  min-height: 100vh;
`

const Logo = styled.a`
  display: block;
  font-size: 2rem;
  color: var(--color-brand-green);
  font-family: var(--font-brand);
  font-weight: 500;
  text-decoration: none;

  span {
    font-family: var(--font-normal);
    font-weight: 300;
  }
`

const LicenceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const Licence = styled.div`
  width: 100%;
  max-width: 40rem;
  padding: 1rem;
  font-size: 0.75rem;
  color: var(--color-text--muted);
  text-align: center;

  a {
    color: var(--color-text--muted);
  }
`
