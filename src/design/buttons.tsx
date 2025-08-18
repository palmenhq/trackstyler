import styled from '@emotion/styled'

export const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font: inherit;
  color: var(--color-bg);
  background: var(--color-brand-green);
  border: 1px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  transition: background-color 50ms;
  white-space: nowrap;

  :hover,
  :focus {
    background: var(--color-brand-green--light);
    color: var(--color-bg);
  }

  :disabled {
    cursor: default;
    background: var(--color-text--muted);
  }
`

export const ButtonLink = styled(Button)`
  text-decoration: none;
`.withComponent('a')
