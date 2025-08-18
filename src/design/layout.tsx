import { FC, PropsWithChildren } from 'react'
import styled from '@emotion/styled'
import { useLocationPathName } from '../util/use-location-path-name.ts'

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const path = useLocationPathName()
  return (
    <LayoutContainer>
      <Sidebar>
        <Logo href="/">
          <span>track</span>styler
        </Logo>

        <SidebarMenu>
          <MenuItem href="/tool/" isActive={path.startsWith('/tool')}>
            Styler tool
          </MenuItem>
          <MenuItem href="/about/" isActive={path.startsWith('/about')}>
            About Trackstyler
          </MenuItem>
        </SidebarMenu>
      </Sidebar>
      <Main>{children}</Main>
    </LayoutContainer>
  )
}

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(12rem, 16rem) 1fr;
  min-height: 100vh;
  max-width: calc(12rem + 75rem);
  gap: 1rem;
`

const Sidebar = styled.div`
  border-right: 1px solid var(--color-border);
  padding: 1rem;
`

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 5rem;
`

const MenuItem = styled.a<{ isActive?: boolean }>`
  text-decoration: none;
  color: var(--color-text);
  position: relative;
  margin-left: 1rem;

  ::before {
    content: ' ';
    border-radius: 999px;
    background: var(--color-brand-green);
    width: 0.4em;
    height: 0.4em;
    position: absolute;
    top: 50%;
    left: -0.75em;
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
`

const Main = styled.main`
  padding: 1rem;
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
