import { PromotionForm } from '#components/PromotionForm'
import {
  getPromotionConfigBySlug,
  promotionToFormValues
} from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'
import { ErrorNotFound } from './ErrorNotFound'

function Page(
  props: RouteComponentProps<{ promotionSlug: string; promotionId?: string }>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const promotionConfig = getPromotionConfigBySlug(props.params.promotionSlug)
  const { isLoading, promotion } = usePromotion(props.params.promotionId)

  if (promotionConfig == null) {
    return <ErrorNotFound />
  }

  return (
    <PageLayout
      title={`New ${promotionConfig.titleNew}`}
      description='Enter basic details to create the promotion, then set conditions or coupons to limit its reach after creation.'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          setLocation(appRoutes.newSelectType.makePath({}))
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <PromotionForm
          promotionSlug={props.params.promotionSlug}
          promotionId={props.params.promotionId}
          defaultValues={promotionToFormValues(promotion)}
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
