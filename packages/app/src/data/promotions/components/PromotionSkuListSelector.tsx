import type { Promotion } from '#types'
import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { QueryParamsList } from '@commercelayer/sdk'

export const PromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Promotion
}> = ({ hint, label, promotion }) => {
  const { sdkClient } = useCoreSdkProvider()

  const { data: skuLists = [] } = useCoreApi('sku_lists', 'list', [
    getParams({ name: '' })
  ])

  return (
    <HookedInputSelect
      name='sku_list'
      label={label}
      isClearable
      hint={{
        text: hint
      }}
      placeholder='Search...'
      initialValues={
        promotion?.sku_list != null
          ? [
              {
                label: promotion.sku_list.name,
                value: promotion.sku_list.id
              }
            ]
          : toInputSelectValues(skuLists)
      }
      loadAsyncValues={async (name) => {
        const skuLists = await sdkClient.sku_lists.list({
          pageSize: 25,
          filters: {
            name_cont: name
          }
        })

        return skuLists.map(({ name, id }) => ({
          label: name,
          value: id
        }))
      }}
    />
  )
}

function getParams({ name }: { name: string }): QueryParamsList {
  return {
    pageSize: 25,
    sort: {
      name: 'asc'
    },
    filters: {
      name_cont: name
    }
  }
}

function toInputSelectValues(
  items: Array<{ name: string; id: string }>
): InputSelectValue[] {
  return items.map(({ name, id }) => ({
    label: name,
    value: id
  }))
}
