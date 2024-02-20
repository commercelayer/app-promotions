import type { promotionConfig } from '#data/promotions/config'
import type { Promotion } from '#types'
import { type z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function promotionToFormValues(promotion?: Promotion) {
  if (promotion == null) {
    return undefined
  }

  return {
    ...promotion,
    starts_at: new Date(promotion.starts_at),
    expires_at: new Date(promotion.expires_at),
    show_sku_list: promotion.sku_list != null,
    show_total_usage_limit: promotion.total_usage_limit != null,
    show_priority: promotion.priority != null,
    sku_list: promotion.sku_list?.id
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formValuesToPromotion(
  formValues?: z.infer<
    (typeof promotionConfig)[keyof typeof promotionConfig]['formType']
  >
) {
  if (formValues == null) {
    return undefined
  }

  return {
    ...formValues,
    total_usage_limit:
      'total_usage_limit' in formValues && formValues.total_usage_limit != null
        ? formValues.total_usage_limit
        : null,
    priority:
      'priority' in formValues && formValues.priority != null
        ? formValues.priority
        : null,
    sku_list: {
      type: 'sku_lists',
      id:
        'sku_list' in formValues && formValues.sku_list != null
          ? formValues.sku_list
          : null
    }
  }
}