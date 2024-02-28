import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title='No promotions found!'
        description={
          <div>
            <p>
              We didn't find any promotions matching the current filters
              selection.
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title='No promotions yet!'
      description={
        <div>
          <p>Add a promotion with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/promotions'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
