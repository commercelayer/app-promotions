import { z } from 'zod'
import { genericPromotionOptions, type PromotionDictionary } from './promotions'

export default {
  buy_x_pay_y_promotions: {
    enable: false,
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y',
    formType: genericPromotionOptions.merge(
      z.object({
        x: z.number(),
        y: z.number(),
        sku_list: z.string().optional()
      })
    ),
    Fields: () => <></>,
    Options: () => <></>
  }
} satisfies Pick<PromotionDictionary, 'buy_x_pay_y_promotions'>
