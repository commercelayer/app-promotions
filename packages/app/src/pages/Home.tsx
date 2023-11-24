import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Section,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

export function Home(): JSX.Element {
  const {
    dashboardUrl,
    settings: { mode }
  } = useTokenProvider()

  return (
    <PageLayout
      title='Promotions'
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        window.location.href =
          dashboardUrl != null ? `${dashboardUrl}/hub` : '/'
      }}
    >
      <Spacer top='10'>
        <Section titleSize='small' title='Browse' actionButton={<Link href={appRoutes.new.makePath({})}><a>New promotion</a></Link>}>
          &nbsp;
        </Section>
      </Spacer>
    </PageLayout>
  )
}
