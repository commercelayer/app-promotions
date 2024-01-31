import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemPromotion } from '#components/ListItemPromotion'
import type { PageProps } from '#components/Routes'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-location'

function Page(props: PageProps<typeof appRoutes.promotionList>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const isUserCustomFiltered =
    hasActiveFilter && viewTitle === presets.all.viewTitle
  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.all.viewTitle
  )

  return (
    <PageLayout
      title='Promotions'
      overlay={props.overlay}
      mode={mode}
      navigationButton={{
        label: 'Promotions',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
      gap='only-top'
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath(queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='promotions'
          ItemTemplate={ListItemPromotion}
          query={{
            include: ['coupons'],
            fields: {
              customers: [
                'id',
                'email',
                'total_orders_count',
                'created_at',
                'updated_at',
                'customer_group'
              ]
            },
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={
                isUserCustomFiltered
                  ? 'userFiltered'
                  : viewTitle !== presets.all.viewTitle
                    ? 'presetView'
                    : 'history'
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default Page
