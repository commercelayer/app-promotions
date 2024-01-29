import { PromotionForm } from '#components/PromotionForm'
import { getPromotionConfigBySlug } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useTokenProvider,
  type GetParams
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'
import { ErrorNotFound } from './ErrorNotFound'

function Page(
  props: RouteComponentProps<GetParams<typeof appRoutes.newPromotion>>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const promotionConfig = getPromotionConfigBySlug(props.params.promotionSlug)

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
      <PromotionForm promotionSlug={props.params.promotionSlug} />
    </PageLayout>
  )
}

export default Page
