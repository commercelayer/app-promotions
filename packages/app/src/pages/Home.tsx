import {
  PageLayout,
  Section,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'

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
        <Section titleSize='small' title='Browse'>
          &nbsp;
        </Section>
      </Spacer>
    </PageLayout>
  )
}
