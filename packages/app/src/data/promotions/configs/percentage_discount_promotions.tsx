import {
  HookedInput,
  HookedInputCheckbox,
  Spacer,
  Text
} from '@commercelayer/app-elements'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  percentage_discount_promotions: {
    enable: true,
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'percent',
    titleList: 'Percentage discount',
    titleNew: 'percentage discount',
    formType: genericPromotionOptions.merge(
      z.object({
        percentage: z
          .string()
          .refine(
            (value) => /^[1-9][0-9]?$|^100$/.test(value),
            'Enter a valid number between 1 and 100'
          )
          .or(z.number().min(1).max(100))
          .transform((p) => parseInt(p.toString())),
        sku_list: z.string().nullish()
      })
    ),
    Fields: () => (
      <>
        <Spacer top='6'>
          <HookedInput
            type='number'
            min={1}
            max={100}
            name='percentage'
            label='Percentage discount'
            hint={{
              text: 'How much the order is discounted in percentage.'
            }}
          />
        </Spacer>
      </>
    ),
    Options: ({ promotion }) => {
      return (
        <>
          <Spacer top='2'>
            <HookedInputCheckbox
              name='show_sku_list'
              checkedElement={
                <Spacer bottom='6'>
                  <PromotionSkuListSelector
                    promotion={promotion}
                    hint='Apply the promotion only to the SKUs within the selected SKU list.'
                  />
                </Spacer>
              }
            >
              <Text weight='semibold'>Restrict to specific SKUs</Text>
            </HookedInputCheckbox>
          </Spacer>
        </>
      )
    }
  }
} satisfies Pick<PromotionConfig, 'percentage_discount_promotions'>
