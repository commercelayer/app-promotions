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

export const promotionDictionary = {
  buy_x_pay_y_promotions: {
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y',
    form: z.object({
      name: z.string().min(1),
      percentage1: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      startOn: z.date(),
      expiresOn: z.date()
    })
  },
  external_promotions: {
    type: 'external_promotions',
    slug: 'external',
    icon: 'stack',
    titleList: 'External promotion',
    titleNew: 'external promotion',
    form: z.object({
      name: z.string().min(1),
      percentage: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      startOn: z.date(),
      expiresOn: z.date()
    })
  },
  fixed_amount_promotions: {
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'stack',
    titleList: 'Fixed amount discount',
    titleNew: 'fixed amount discount',
    form: z.object({
      name: z.string().min(1),
      fixed_amount_cents: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      starts_at: z.date(),
      expires_at: z.date()
    })
  },
  fixed_price_promotions: {
    type: 'fixed_price_promotions',
    slug: 'fixed-price',
    icon: 'stack',
    titleList: 'Fixed price',
    titleNew: 'fixed price',
    form: z.object({
      name: z.string().min(1),
      percentage: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      startOn: z.date(),
      expiresOn: z.date()
    })
  },
  free_gift_promotions: {
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'stack',
    titleList: 'Free gift',
    titleNew: 'free gift',
    form: z.object({
      name: z.string().min(1),
      percentage: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      startOn: z.date(),
      expiresOn: z.date()
    })
  },
  free_shipping_promotions: {
    type: 'free_shipping_promotions',
    slug: 'free-shipping',
    icon: 'truck',
    titleList: 'Free shipping',
    titleNew: 'free shipping',
    form: z.object({
      name: z.string().min(1),
      percentage: z
        .string()
        .min(1)
        .transform((p) => parseInt(p)),
      startOn: z.date(),
      expiresOn: z.date()
    })
  },
  percentage_discount_promotions: {
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'stack',
    titleList: 'Percentage discount',
    titleNew: 'percentage discount',
    form: z.object({
      name: z.string().min(1),
      percentage: z
        .number()
        .or(z.string().min(1))
        .transform((p) => parseInt(p.toString())),
      starts_at: z.date(),
      expires_at: z.date()
    })
  }
} as const

// HELPER

export function isPromotionType(
  promotionType: any
): promotionType is PromotionType {
  return Object.keys(promotionDictionary).includes(promotionType)
}

export function isPromotionSlug(
  promotionSlug: any
): promotionSlug is PromotionSlug {
  return Object.values(promotionDictionary)
    .map((v) => v.slug)
    .includes(promotionSlug)
}

export function getPromotionConfigBySlug(
  promotionSlug: string
): (typeof promotionDictionary)[PromotionType] {
  const configuration = Object.values(promotionDictionary).find(
    (v) => v.slug === promotionSlug
  )

  if (configuration == null) {
    throw new Error(`Cannot find the slug "${promotionSlug}"`)
  }

  return configuration
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
