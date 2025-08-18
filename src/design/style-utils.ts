import { css } from '@emotion/react'

export const fontHeadline = css`
  font-family: var(--font-brand);
`
export const fontNormal = css`
  font-family: var(--font-normal);
`
export const pushTopXs = css`
  margin-right: 0.5em;
`

export const pushRight = css`
  margin-right: 1em;
`

export const pushRightSm = css`
  margin-right: 0.75em;
`

export const pushRightXs = css`
  margin-right: 0.5em;
`

export const pushBottom = css`
  margin-bottom: 1em;
`

export const spin = css`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(260deg);
    }
  }

  animation: spin 600ms infinite linear;
`
