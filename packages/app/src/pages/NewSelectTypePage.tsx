import type { PageProps } from '#components/Routes'
import { promotionConfig, type PromotionType } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import {
  Icon,
  ListItem,
  PageLayout,
  Section,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newSelectType>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  return (
    <PageLayout
      title='Select type'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <Spacer top='10'>
        <Section titleSize='small' title='Preset'>
          <LinkTo promotionType='percentage_discount_promotions' />
          <LinkTo promotionType='free_shipping_promotions' />
          <LinkTo promotionType='fixed_amount_promotions' />
          <LinkTo promotionType='free_gift_promotions' />
          <LinkTo promotionType='fixed_price_promotions' />
          <LinkTo promotionType='buy_x_pay_y_promotions' />
        </Section>
      </Spacer>
      <Spacer top='10'>
        <Section titleSize='small' title='More'>
          <LinkTo promotionType='external_promotions' />
        </Section>
      </Spacer>
    </PageLayout>
  )
}

function LinkTo({
  promotionType
}: {
  promotionType: PromotionType
}): React.ReactNode {
  const { canUser } = useTokenProvider()
  const config = promotionConfig[promotionType]

  if (!canUser('create', promotionType)) {
    return null
  }

  return (
    <Link
      href={appRoutes.newPromotion.makePath({
        promotionType: config.type
      })}
      asChild
    >
      <ListItem tag='a' icon={<Icon name={config.icon} size={24} />}>
        <Text weight='semibold'>{config.titleList}</Text>
        <Icon name='caretRight' />
      </ListItem>
    </Link>
  )
}

export default Page
