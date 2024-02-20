import { genericPromotionOptions, type PromotionDictionary } from './promotions'

export default {
  external_promotions: {
    enable: false,
    type: 'external_promotions',
    slug: 'external',
    icon: 'linkSimple',
    titleList: 'External promotion',
    titleNew: 'external promotion',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>
  }
} satisfies Pick<PromotionDictionary, 'external_promotions'>
