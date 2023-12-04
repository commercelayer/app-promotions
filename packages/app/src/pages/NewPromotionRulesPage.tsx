import { promotionDictionary } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<typeof appRoutes.newPromotionRules.params>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { promotion } = usePromotion(props.params.promotionId)

  return (
    <PageLayout
      title='Activation conditions'
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        setLocation(
          appRoutes.newPromotionEdit.makePath({
            promotionSlug: promotionDictionary[promotion.type].slug,
            promotionId: props.params.promotionId
          })
        )
      }}
    >
      <Spacer top='10'>Ehi there!</Spacer>
    </PageLayout>
  )
}

export default Page
