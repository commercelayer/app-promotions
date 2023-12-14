import { NewPromotionForm } from '#components/NewPromotionForm'
import {
  getPromotionConfigBySlug,
  promotionToFormValues
} from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
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
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        setLocation(appRoutes.selectType.makePath({}))
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='10'>
          <Section title='Basic info'>
            <NewPromotionForm
              promotionSlug={props.params.promotionSlug}
              promotionId={props.params.promotionId}
              defaultValues={promotionToFormValues(promotion)}
            />
          </Section>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
