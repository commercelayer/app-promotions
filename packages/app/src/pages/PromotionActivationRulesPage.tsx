import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  Button,
  ButtonCard,
  PageLayout,
  Spacer
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(
  props: PageProps<typeof appRoutes.promotionActivationRules>
): JSX.Element | null {
  const [, setLocation] = useLocation()

  const promotionDetailsUrl = appRoutes.promotionDetails.makePath({
    promotionId: props.params.promotionId
  })

  return (
    <PageLayout
      title='Activation rules'
      description='Define activation rules to target specific orders before launching the promotion.'
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(promotionDetailsUrl)
        }
      }}
    >
      <Spacer top='10'>
        <Spacer top='2'>
          <ButtonCard
            fullWidth
            icon='plus'
            iconLabel='Activation rule'
            onClick={() => {
              setLocation(
                appRoutes.newPromotionActivationRule.makePath({
                  promotionId: props.params.promotionId
                })
              )
            }}
          />
        </Spacer>
      </Spacer>

      <Spacer top='14'>
        <Button
          fullWidth
          onClick={() => {
            setLocation(promotionDetailsUrl)
          }}
        >
          Continue to promotion
        </Button>
      </Spacer>
    </PageLayout>
  )
}

export default Page
