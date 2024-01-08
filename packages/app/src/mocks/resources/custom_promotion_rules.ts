import type { PromotionRule } from '#data/dictionaries/promotion'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeCustomPromotionRule = (
  overrides?: Partial<CustomPromotionRule>
): PromotionRule => {
  return {
    ...makeResource(),
    type: 'custom_promotion_rules',
    ...overrides
  }
}
