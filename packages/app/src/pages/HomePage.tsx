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
    settings: { mode },
    canUser
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
            canUser('create', 'buy_x_pay_y_promotions') ||
            canUser('create', 'external_promotions') ||
            canUser('create', 'fixed_amount_promotions') ||
            canUser('create', 'fixed_price_promotions') ||
            canUser('create', 'free_gift_promotions') ||
            canUser('create', 'free_shipping_promotions') ||
            canUser('create', 'percentage_discount_promotions') ? (
              <Link href={appRoutes.newSelectType.makePath({})}>
                <a>Add promo</a>
              </Link>
            ) : undefined
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
