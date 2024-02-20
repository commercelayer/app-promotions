import type { PageProps } from '#components/Routes'
import { promotionDictionary } from '#data/promotions/config'
import type { PromotionType } from '#data/promotions/configs/promotions'
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
  const EnabledLink = promotion.enable ? Link : 'div'

  return (
    <EnabledLink
      href={appRoutes.newPromotion.makePath({
        promotionSlug: promotion.slug
      })}
      {...(promotion.enable ? { asChild: true } : {})}
    >
      <ListItem
        tag={promotion.enable ? 'a' : 'div'}
        icon={<Icon name={promotion.icon} size={24} />}
      >
        <Text weight='semibold'>{promotion.titleList}</Text>
        {promotion.enable && <Icon name='caretRight' />}
      </ListItem>
    </EnabledLink>
  )
}

export default Page
