import type { IconProps } from '@commercelayer/app-elements'
import type {
  BuyXPayYPromotion,
  CouponCodesPromotionRule,
  CustomPromotionRule,
  ExternalPromotion,
  FixedAmountPromotion,
  FixedPricePromotion,
  FreeGiftPromotion,
  FreeShippingPromotion,
  OrderAmountPromotionRule,
  PercentageDiscountPromotion,
  SkuListPromotionRule
} from '@commercelayer/sdk'
import type { ResourceTypeLock } from '@commercelayer/sdk/lib/cjs/api'
import type { Replace } from 'type-fest'
import { z } from 'zod'

type Sanitize<PT extends PromotionType> = Replace<
  Replace<PT, '_promotions', ''>,
  '_',
  '-',
  { all: true }
>

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type Promotion = (
  | Omit<BuyXPayYPromotion, 'promotion_rules'>
  | Omit<ExternalPromotion, 'promotion_rules'>
  | Omit<FixedAmountPromotion, 'promotion_rules'>
  | Omit<FixedPricePromotion, 'promotion_rules'>
  | Omit<FreeGiftPromotion, 'promotion_rules'>
  | Omit<FreeShippingPromotion, 'promotion_rules'>
  | Omit<PercentageDiscountPromotion, 'promotion_rules'>
) & {
  promotion_rules?: PromotionRule[] | null
}

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type PromotionRule =
  | CustomPromotionRule
  | SkuListPromotionRule
  | CouponCodesPromotionRule
  | OrderAmountPromotionRule

export type PromotionType = Extract<ResourceTypeLock, `${string}_promotions`>
export type PromotionSlug = Sanitize<PromotionType>

export type PromotionDictionary = {
  [type in PromotionType]: {
    type: type
    slug: Sanitize<type>
    titleList: string
    titleNew: string
    icon: IconProps['name']
    form: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny>
  }
}

const genericPromotionOptions = z.object({
  name: z.string().min(1),
  starts_at: z.date(),
  expires_at: z.date()
})

export const promotionDictionary = {
  buy_x_pay_y_promotions: {
    enable: false,
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y',
    form: genericPromotionOptions.merge(
      z.object({
        x: z.number(),
        y: z.number(),
        sku_list: z.object({ type: z.literal('sku_lists'), id: z.string() })
      })
    )
  },
  external_promotions: {
    enable: false,
    type: 'external_promotions',
    slug: 'external',
    icon: 'linkSimple',
    titleList: 'External promotion',
    titleNew: 'external promotion',
    form: genericPromotionOptions.merge(z.object({}))
  },
  fixed_amount_promotions: {
    enable: false,
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'currencyEur',
    titleList: 'Fixed amount discount',
    titleNew: 'fixed amount discount',
    form: genericPromotionOptions.merge(
      z.object({
        fixed_amount_cents: z
          .string()
          .min(1)
          .transform((p) => parseInt(p))
      })
    )
  },
  fixed_price_promotions: {
    enable: false,
    type: 'fixed_price_promotions',
    slug: 'fixed-price',
    icon: 'pushPin',
    titleList: 'Fixed price',
    titleNew: 'fixed price',
    form: genericPromotionOptions.merge(z.object({}))
  },
  free_gift_promotions: {
    enable: false,
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'gift',
    titleList: 'Free gift',
    titleNew: 'free gift',
    form: genericPromotionOptions.merge(z.object({}))
  },
  free_shipping_promotions: {
    enable: false,
    type: 'free_shipping_promotions',
    slug: 'free-shipping',
    icon: 'truck',
    titleList: 'Free shipping',
    titleNew: 'free shipping',
    form: genericPromotionOptions.merge(z.object({}))
  },
  percentage_discount_promotions: {
    enable: true,
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'percent',
    titleList: 'Percentage discount',
    titleNew: 'percentage discount',
    form: genericPromotionOptions.merge(
      z.object({
        percentage: z
          .number()
          .max(100)
          .or(
            z
              .string()
              .min(1)
              .regex(/^[1-9][0-9]?$|^100$/)
          )
          .transform((p) => parseInt(p.toString()))
      })
    )
  }
} as const satisfies Record<
  string,
  {
    enable: boolean
    type: string
    slug: string
    icon: IconProps['name']
    titleList: string
    titleNew: string
    form: z.AnyZodObject
  }
>

// HELPER

export function getPromotionConfigBySlug(
  promotionSlug: string
): (typeof promotionDictionary)[PromotionType] | null {
  const configuration = Object.values(promotionDictionary).find(
    (v) => v.slug === promotionSlug
  )

  return configuration ?? null
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function promotionToFormValues(promotion?: Promotion) {
  if (promotion == null) {
    return undefined
  }

  return {
    ...promotion,
    starts_at: new Date(promotion.starts_at),
    expires_at: new Date(promotion.expires_at)
  }
}
