import { getPromotionBySlug } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Section,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation, type RouteComponentProps } from 'wouter'
import { ErrorNotFound } from './ErrorNotFound'

function Page(
  props: RouteComponentProps<{ promotionSlug: string }>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const promotion = getPromotionBySlug(props.params.promotionSlug)

  if (promotion == null) {
    return <ErrorNotFound />
  }

  return (
    <PageLayout
      title={`New ${promotion.titleNew}`}
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        setLocation(appRoutes.selectType.makePath({}))
      }}
    >
      <Spacer top='10'>
        <Section title='Basic info'>
          <Spacer top='4'>Ehi there!</Spacer>
        </Section>
      </Spacer>
    </PageLayout>
  )
}

export default Page
