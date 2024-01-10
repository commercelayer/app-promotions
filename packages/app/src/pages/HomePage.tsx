import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Section,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

function HomePage(): JSX.Element {
  const {
    dashboardUrl,
    settings: { mode }
  } = useTokenProvider()

  return (
    <PageLayout
      title='Promotions'
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          window.location.href =
            dashboardUrl != null ? `${dashboardUrl}/hub` : '/'
        },
        label: 'Hub'
      }}
    >
      <Spacer top='10'>
        <Section
          titleSize='small'
          title='Browse'
          actionButton={
            <Link href={appRoutes.newSelectType.makePath({})}>
              <a>New promotion</a>
            </Link>
          }
        >
          &nbsp;
        </Section>
      </Spacer>
    </PageLayout>
  )
}

export default HomePage
