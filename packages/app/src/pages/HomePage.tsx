import { appRoutes } from '#data/routes'
import {
  Icon,
  List,
  ListItem,
  PageLayout,
  Spacer,
  StatusIcon,
  Text,
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
      <Spacer top='14'>
        <List
          title='Browse'
          actionButton={
            <Link href={appRoutes.newSelectType.makePath({})}>
              <a>New promo</a>
            </Link>
          }
        >
          <Link href={appRoutes.list.makePath({})}>
            <ListItem
              tag='a'
              icon={
                <StatusIcon
                  name='asteriskSimple'
                  background='black'
                  gap='small'
                />
              }
            >
              <Text weight='semibold'>All promotions</Text>
              <Icon name='caretRight' />
            </ListItem>
          </Link>
        </List>
      </Spacer>
    </PageLayout>
  )
}

export default HomePage
