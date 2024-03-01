import type { Promotion } from '#types'
import {
  HookedInputCheckbox,
  HookedInputSelect,
  Section,
  Spacer,
  Text,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { QueryParamsList } from '@commercelayer/sdk'

export const PromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Promotion
  optional?: boolean
  placeholder?: string
}> = ({ hint, label, promotion, placeholder, optional = false }) => {
  if (!optional) {
    return (
      <InternalPromotionSkuListSelector
        label={label}
        hint={hint}
        promotion={promotion}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Spacer top='14'>
      <Section title='Apply the discount to'>
        <Spacer top='6'>
          <Spacer top='2'>
            <HookedInputCheckbox
              name='show_sku_list'
              checkedElement={
                <Spacer bottom='6'>
                  <InternalPromotionSkuListSelector
                    promotion={promotion}
                    hint={hint}
                    placeholder={placeholder}
                  />
                </Spacer>
              }
            >
              <Text weight='semibold'>Restrict to specific SKUs</Text>
            </HookedInputCheckbox>
          </Spacer>
        </Spacer>
      </Section>
    </Spacer>
  )
}

const InternalPromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Promotion
  placeholder?: string
}> = ({ hint, label, promotion, placeholder = 'Search...' }) => {
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
      placeholder={placeholder}
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
