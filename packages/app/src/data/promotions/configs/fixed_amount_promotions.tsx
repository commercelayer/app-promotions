import { z } from 'zod'
import { genericPromotionOptions, type PromotionDictionary } from './promotions'

export default {
  fixed_amount_promotions: {
    enable: false,
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'currencyEur',
    titleList: 'Fixed amount discount',
    titleNew: 'fixed amount discount',
    formType: genericPromotionOptions.merge(
      z.object({
        fixed_amount_cents: z
          .string()
          .min(1)
          .transform((p) => parseInt(p))
      })
    ),
    Fields: () => <></>,
    Options: () => <></>
  }
} satisfies Pick<PromotionDictionary, 'fixed_amount_promotions'>
