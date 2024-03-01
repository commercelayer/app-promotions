import {
  A,
  Grid,
  HookedInput,
  HookedInputCheckbox,
  Icon,
  ListDetailsItem,
  Spacer,
  Text
} from '@commercelayer/app-elements'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  buy_x_pay_y_promotions: {
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y',
    formType: genericPromotionOptions.merge(
      z.object({
        sku_list: z.string(),
        x: z
          .number()
          .min(1)
          .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$/))
          .transform((p) =>
            p != null && p !== '' ? parseInt(p.toString()) : undefined
          ),
        y: z
          .number()
          .min(1)
          .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$/))
          .transform((p) =>
            p != null && p !== '' ? parseInt(p.toString()) : undefined
          ),
        cheapest_free: z.boolean().default(false)
      })
    ),
    Fields: ({ promotion }) => {
      return (
        <>
          <Spacer top='6'>
            <PromotionSkuListSelector
              promotion={promotion}
              label='Promoted products *'
              hint='Apply the promotion to any SKUs within this list.'
            />
          </Spacer>
          <Spacer top='6'>
            <Grid columns='2'>
              <HookedInput
                type='number'
                min={1}
                name='x'
                label='Buy *'
                hint={{
                  text: 'Minimum quantity to activate the promo.'
                }}
              />
              <HookedInput
                type='number'
                min={1}
                name='y'
                label='Pay *'
                hint={{
                  text: 'Items that will be charged.'
                }}
              />
            </Grid>
          </Spacer>
        </>
      )
    },
    Options: () => (
      <>
        <Spacer top='2'>
          <HookedInputCheckbox name='cheapest_free'>
            <Text weight='semibold'>Cheapest free</Text>{' '}
            <A href='https://docs.commercelayer.io/core/v/api-reference/buy_x_pay_y_promotions#cheapest-free'>
              <Icon
                style={{ display: 'inline-block' }}
                name='question'
                weight='bold'
                size={18}
              />
            </A>
          </HookedInputCheckbox>
        </Spacer>
      </>
    ),
    DetailsSectionInfo: ({ promotion }) => (
      <>
        <ListDetailsItem label='Buy' gutter='none'>
          {promotion.x}
        </ListDetailsItem>
        <ListDetailsItem label='Pay' gutter='none'>
          {promotion.y}
        </ListDetailsItem>
        {promotion.cheapest_free === true && (
          <ListDetailsItem label='Cheapest free' gutter='none'>
            <Text variant='success'>
              <Icon name='check' weight='bold' size={18} />
            </Text>
          </ListDetailsItem>
        )}
      </>
    )
  }
} satisfies Pick<PromotionConfig, 'buy_x_pay_y_promotions'>
