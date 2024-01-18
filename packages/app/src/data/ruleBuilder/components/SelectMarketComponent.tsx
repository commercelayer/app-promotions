import {
  HookedInputSelect,
  useCoreSdkProvider
} from '@commercelayer/app-elements'

export function SelectMarketComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  return (
    <HookedInputSelect
      name='value'
      initialValues={[]}
      loadAsyncValues={async (value) => {
        const markets = await sdkClient.markets.list({
          filters: {
            name_cont: value
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
