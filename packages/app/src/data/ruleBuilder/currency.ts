import type { Promotion } from '#data/dictionaries/promotion'
import type { CurrencyCode } from '@commercelayer/app-elements'
import { currencies } from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'

/**
 * Get the list of currency codes given a `Promotion`.
 */
export function getCurrencyCodes(promotion: Promotion): CurrencyCode[] {
  const currencyCodeFromPromotion = promotion.currency_code as
    | CurrencyCode
    | null
    | undefined

  const currencyCodeFromPromotionMarket = promotion.market?.price_list
    ?.currency_code as CurrencyCode | null | undefined

  const customPromotionRule = promotion.promotion_rules?.find(
    (pr): pr is CustomPromotionRule => pr.type === 'custom_promotion_rules'
  )

  const currencyCodeInList = (
    customPromotionRule?.filters?.currency_code_in as string | null | undefined
  )?.split(',') as CurrencyCode[] | null | undefined

  const currencyCodeNotIn = customPromotionRule?.filters
    ?.currency_code_not_in as string | null | undefined

  const currencyCodeNotInAsArray =
    currencyCodeNotIn != null ? currencyCodeNotIn.split(',') : null

  const currencyCodeNotInList = (
    currencyCodeNotInAsArray != null
      ? Object.values(currencies)
          .map((obj) => obj.iso_code)
          .filter((code) => !currencyCodeNotInAsArray.includes(code))
      : null
  ) as CurrencyCode[] | null | undefined

  const currencyCodes =
    currencyCodeFromPromotion != null
      ? [currencyCodeFromPromotion]
      : currencyCodeFromPromotionMarket != null
        ? [currencyCodeFromPromotionMarket]
        : currencyCodeInList ?? currencyCodeNotInList ?? []

  return currencyCodes
}
