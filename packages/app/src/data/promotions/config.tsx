import buy_x_pay_y_promotions from './configs/buy_x_pay_y_promotions'
import external_promotions from './configs/external_promotions'
import fixed_amount_promotions from './configs/fixed_amount_promotions'
import fixed_price_promotions from './configs/fixed_price_promotions'
import free_gift_promotions from './configs/free_gift_promotions'
import free_shipping_promotions from './configs/free_shipping_promotions'
import percentage_discount_promotions from './configs/percentage_discount_promotions'
import { type PromotionDictionary } from './configs/promotions'

export const promotionDictionary: PromotionDictionary = {
  ...buy_x_pay_y_promotions,
  ...external_promotions,
  ...fixed_amount_promotions,
  ...fixed_price_promotions,
  ...free_gift_promotions,
  ...free_shipping_promotions,
  ...percentage_discount_promotions
}
