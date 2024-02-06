import { A, EmptyState } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView' | 'noSKUs' | 'noBundles'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  if (scope === 'presetView') {
    return (
      <EmptyState
        title='All good here'
        description={
          <div>
            <p>There are no promotions for the current list.</p>
          </div>
        }
      />
    )
  }

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

  if (scope === 'noSKUs') {
    return (
      <EmptyState
        title='No SKUs found!'
        description={
          <div>
            <p>
              We didn't find any SKU matching the current filters selection.
            </p>
          </div>
        }
      />
    )
  }

  if (scope === 'noBundles') {
    return (
      <EmptyState
        title='No bundles found!'
        description={
          <div>
            <p>
              We didn't find any bundle matching the current filters selection.
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
