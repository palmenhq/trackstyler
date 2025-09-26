import {
  Children,
  cloneElement,
  FC,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react'
import styled from '@emotion/styled'

type OptionSelectProps = {
  formName: string
}

export const Selector: FC<PropsWithChildren<OptionSelectProps>> = ({
  formName,
  children,
}) => {
  const singleChildMaybe = (children ?? {}) as
    | ReactElement<OptionSelectProps>
    | object
  return (
    <div>
      {Array.isArray(children) &&
        Children.map(children, (child) => cloneElement(child, { formName }))}

      {!Array.isArray(children) &&
        'isReactComponent' in singleChildMaybe &&
        typeof singleChildMaybe.isReactComponent === 'function' &&
        singleChildMaybe.isReactComponent() &&
        cloneElement<OptionSelectProps>(
          singleChildMaybe as ReactElement<OptionSelectProps>,
          { formName },
        )}
    </div>
  )
}

type OptionProps = PropsWithChildren<
  Omit<OptionSelectProps, 'formName'> & InputHTMLAttributes<HTMLInputElement>
>

export const SelectorOption: FC<OptionProps> = (props) => {
  const { formName, children, ...inputProps } = props as OptionSelectProps &
    OptionProps
  return (
    <RadioLabel>
      <Radio type="radio" name={formName} {...inputProps} />
      <Value>{children}</Value>
    </RadioLabel>
  )
}

const RadioLabel = styled.label`
  display: inline-flex;
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  :first-of-type {
    border-radius: 0.25rem 0 0 0.25rem;
  }
  :last-of-type {
    border-radius: 0 0.25rem 0.25rem 0;
  }

  :not(:first-of-type) {
    border-left: 0;
  }
`

const Radio = styled.input`
  visibility: hidden;
  appearance: none;
  width: 0;
  height: 0;
  position: absolute;
`

const Value = styled.span`
  padding: 0.25rem 0.5rem;

  input:checked + &,
  :hover,
  :focus {
    background-color: var(--color-bg-interactive--active);
  }
`
