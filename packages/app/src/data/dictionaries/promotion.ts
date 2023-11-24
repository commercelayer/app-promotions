import type { IconProps } from '@commercelayer/app-elements'
import type { ResourceTypeLock } from '@commercelayer/sdk/lib/cjs/api'
import type { Replace } from 'type-fest'

type Sanitize<PT extends PromotionType> = Replace<
  Replace<PT, '_promotions', ''>,
  '_',
  '-',
  { all: true }
>

export type PromotionType = Extract<ResourceTypeLock, `${string}_promotions`>
export type PromotionSlug = Sanitize<PromotionType>

export type PromotionDictionary = {
  [type in PromotionType]: {
    type: type
    slug: Sanitize<type>
    titleList: string
    titleNew: string
    icon: IconProps['name']
  }
}

export const promotionDictionary: PromotionDictionary = {
  buy_x_pay_y_promotions: {
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y'
  },
  external_promotions: {
    type: 'external_promotions',
    slug: 'external',
    icon: 'stack',
    titleList: 'External promotion',
    titleNew: 'external promotion'
  },
  fixed_amount_promotions: {
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'stack',
    titleList: 'Fixed amount discount',
    titleNew: 'fixed amount discount'
  },
  fixed_price_promotions: {
    type: 'fixed_price_promotions',
    slug: 'fixed-price',
    icon: 'stack',
    titleList: 'Fixed price',
    titleNew: 'fixed price'
  },
  free_gift_promotions: {
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'stack',
    titleList: 'Free gift',
    titleNew: 'free gift'
  },
  free_shipping_promotions: {
    type: 'free_shipping_promotions',
    slug: 'free-shipping',
    icon: 'truck',
    titleList: 'Free shipping',
    titleNew: 'free shipping'
  },
  percentage_discount_promotions: {
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'stack',
    titleList: 'Percentage discount',
    titleNew: 'percentage discount'
  }
}

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

export function getPromotionBySlug(
  promotionSlug: string
): PromotionDictionary[PromotionType] | undefined {
  return Object.values(promotionDictionary).find(
    (v) => v.slug === promotionSlug
  )
}
