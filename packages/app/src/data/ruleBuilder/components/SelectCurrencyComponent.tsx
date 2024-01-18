import {
  HookedInputSelect,
  type InputSelectValue
} from '@commercelayer/app-elements'
import { currencies } from '../currencies'

export function SelectCurrencyComponent(): JSX.Element {
  const currencyValues: InputSelectValue[] = Object.entries(currencies).map(
    ([code, currency]) => ({
      label: `${currency.name} (${code.toUpperCase()})`,
      value: code.toUpperCase()
    })
  )
  return (
    <HookedInputSelect name='value' initialValues={currencyValues} isMulti />
  )
}
