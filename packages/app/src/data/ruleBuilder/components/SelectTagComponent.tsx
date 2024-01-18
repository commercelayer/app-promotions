import {
  HookedInputSelect,
  useCoreSdkProvider
} from '@commercelayer/app-elements'

export function SelectTagComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  return (
    <HookedInputSelect
      name='value'
      initialValues={[]}
      loadAsyncValues={async (value) => {
        const tags = await sdkClient.tags.list({
          filters: {
            name_cont: value
          }
        })

        return tags.map((tag) => ({
          label: tag.name,
          value: tag.id
        }))
      }}
      isMulti
    />
  )
}
