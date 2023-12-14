import type { Promotion } from '#data/dictionaries/promotion'
import { makeResource } from '../resource'

export const makePromotion = (): Promotion => {
  return {
    ...makeResource(),
    type: 'percentage_discount_promotions',
    name: 'Example',
    starts_at: new Date().toJSON(),
    expires_at: new Date().toJSON(),
    total_usage_limit: 4,
    percentage: 50
  }
}
