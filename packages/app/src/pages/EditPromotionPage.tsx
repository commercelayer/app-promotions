import { PromotionForm } from '#components/PromotionForm'
import {
  promotionDictionary,
  promotionToFormValues
} from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  useTokenProvider,
  type GetParams
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<GetParams<typeof appRoutes.editPromotion>>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion } = usePromotion(props.params.promotionId)
  const promotionConfig = promotionDictionary[promotion.type]

  return (
    <PageLayout
      title='Edit promotion'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(
            appRoutes.promotionDetails.makePath({
              promotionId: props.params.promotionId
            })
          )
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <PromotionForm
          promotionSlug={promotionConfig.slug}
          promotionId={props.params.promotionId}
          defaultValues={promotionToFormValues(promotion)}
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
