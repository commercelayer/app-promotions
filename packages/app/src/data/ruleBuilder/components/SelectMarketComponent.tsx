import type { Promotion } from '#data/dictionaries/promotion'
import {
  HookedInputSelect,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { useCurrencyCodes } from '../currency'

export function SelectMarketComponent({
  promotion
}: {
  promotion: Promotion
}): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { currencyCodes } = useCurrencyCodes(promotion)

  return (
    <HookedInputSelect
      key={currencyCodes.join(',')}
      name='value'
      initialValues={[]}
      loadAsyncValues={async (value: string) => {
        const markets = await sdkClient.markets.list({
          filters: {
            name_cont: value,
            price_list_currency_code_in: currencyCodes.join(',')
          }
        })

        return markets.map((market) => ({
          label: market.name,
          value: market.id
        }))
      }}
      isMulti
    />
  )
}
