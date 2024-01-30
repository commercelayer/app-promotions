import { appRoutes } from '#data/routes'
import { RuleBuilderForm } from '#data/ruleBuilder/form/RuleBuilderForm'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider,
  type GetParams
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<GetParams<typeof appRoutes.newPromotionCondition>>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion } = usePromotion(props.params.promotionId)

  return (
    <PageLayout
      title='New condition'
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
        <Spacer top='10'>
          <RuleBuilderForm
            promotion={promotion}
            onSuccess={() => {
              setLocation(
                appRoutes.promotionDetails.makePath({
                  promotionId: props.params.promotionId
                })
              )
            }}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
