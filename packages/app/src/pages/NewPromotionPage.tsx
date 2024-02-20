import { PromotionForm } from '#components/PromotionForm'
import { GenericPageNotFound, type PageProps } from '#components/Routes'
import { getPromotionConfigBySlug } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { PageLayout, useTokenProvider } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newPromotion>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const promotionConfig = getPromotionConfigBySlug(props.params.promotionSlug)

  if (promotionConfig == null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      title={`New ${promotionConfig.titleNew}`}
      description='Enter basic details to create the promotion, then set conditions or coupons to limit its reach after creation.'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          setLocation(appRoutes.newSelectType.makePath({}))
        }
      }}
    >
      <PromotionForm
        promotionConfig={promotionConfig}
        defaultValues={{ currency_code: 'USD' }}
      />
    </PageLayout>
  )
}

export default Page
