import { PromotionForm } from '#components/PromotionForm'
import { GenericPageNotFound, type PageProps } from '#components/Routes'
import { promotionDictionary } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { PageLayout, useTokenProvider } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newPromotion>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  // @ts-expect-error This will be solved in next element release
  const promotionConfig = promotionDictionary[props.params.promotionType]

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
