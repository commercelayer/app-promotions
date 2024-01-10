import {
  promotionDictionary,
  type PromotionType
} from '#data/dictionaries/promotion'
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
import { useLocation } from 'wouter'

function Page(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  return (
    <PageLayout
      title='Select type'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Cancel',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <Spacer top='10'>
        <Section titleSize='small' title='Preset'>
          <LinkTo promotionType='buy_x_pay_y_promotions' />
          <LinkTo promotionType='fixed_amount_promotions' />
          <LinkTo promotionType='fixed_price_promotions' />
          <LinkTo promotionType='free_gift_promotions' />
          <LinkTo promotionType='free_shipping_promotions' />
          <LinkTo promotionType='percentage_discount_promotions' />
        </Section>
      </Spacer>
      <Spacer top='10'>
        <Section titleSize='small' title='Custom'>
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
}): JSX.Element {
  const promotion = promotionDictionary[promotionType]

  return (
    <ListItem
      tag='a'
      icon={<Icon name='resources' />}
      // icon={<Icon name={promotion.icon} />}
      href={appRoutes.newPromotion.makePath({ promotionSlug: promotion.slug })}
    >
      <Text weight='semibold'>{promotion.titleList}</Text>
      <Icon name='caretRight' />
    </ListItem>
  )
}

export default Page
