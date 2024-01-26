import {
  HookedInputSelect,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { QueryParamsList } from '@commercelayer/sdk'

export function SelectTagComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()

  // const { data: tags = [] } = useCoreApi('tags', 'list', [
  //   getParams({ name: '' })
  // ])

  return (
    <HookedInputSelect
      name='value'
      placeholder='Search...'
      initialValues={[]}
      loadAsyncValues={async (name) => {
        const tags = await sdkClient.tags.list(getParams({ name }))

        return toInputSelectValues(tags)
      }}
      isMulti
    />
  )
}

function getParams({ name }: { name: string }): QueryParamsList {
  return {
    pageSize: 25,
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
