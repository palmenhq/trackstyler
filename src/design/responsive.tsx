import { css } from '@emotion/react'

export const screenSizes = {
  mobileDown: 'max-width: 428px',
  tabletUp: 'min-width: 429px',
} as const

export const mediaQuery: Record<keyof typeof screenSizes, typeof css> = {
  mobileDown: (styling, ...args) => css`
    @media (${screenSizes.mobileDown}) {
      ${css(styling, ...args)};
    }
  `,
  tabletUp: (styling, ...args) => css`
    @media (${screenSizes.tabletUp}) {
      ${css(styling, ...args)};
    }
  `,
}

export const hiddenMobile = css`
  ${mediaQuery.mobileDown`
    display: none;
  `}
`
