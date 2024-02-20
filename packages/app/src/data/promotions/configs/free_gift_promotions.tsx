import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  free_gift_promotions: {
    enable: false,
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'gift',
    titleList: 'Free gift',
    titleNew: 'free gift',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>
  }
} satisfies Pick<PromotionConfig, 'free_gift_promotions'>
