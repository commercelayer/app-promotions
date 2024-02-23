import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  external_promotions: {
    visible: false,
    type: 'external_promotions',
    slug: 'external',
    icon: 'linkSimple',
    titleList: 'External promotion',
    titleNew: 'external promotion',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'external_promotions'>
