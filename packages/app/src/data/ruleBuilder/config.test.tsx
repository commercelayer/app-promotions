import {
  makeCustomPromotionRule,
  makeMarket,
  makePercentageDiscountPromotion,
  makePriceList
} from '#mocks'
import { getCurrencyCodes } from './config'
import { currencies } from './currencies'

describe('getCurrencyCodes', () => {
  it('should return null when there are no currency codes associated to the promotion', () => {
    expect(getCurrencyCodes(makePercentageDiscountPromotion())).toEqual(null)
  })

  it('should return the currency code from a promotion', () => {
    expect(
      getCurrencyCodes(
        makePercentageDiscountPromotion({ currency_code: 'USD' })
      )
    ).toEqual(['USD'])
  })

  it('should return the currency code from the market linked to the promotion', () => {
    expect(
      getCurrencyCodes(
        makePercentageDiscountPromotion({
          market: makeMarket({
            price_list: makePriceList({ currency_code: 'EUR' })
          })
        })
      )
    ).toEqual(['EUR'])
  })

  it('should return the currency code from the custom rules (currency_code_in)', () => {
    expect(
      getCurrencyCodes(
        makePercentageDiscountPromotion({
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { currency_code_in: 'AED,EUR' }
            })
          ]
        })
      )
    ).toEqual(['AED', 'EUR'])
  })

  it('should return the currency code from the custom rules (currency_code_not_in)', () => {
    expect(
      getCurrencyCodes(
        makePercentageDiscountPromotion({
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { currency_code_not_in: 'AED,EUR' }
            })
          ]
        })
      )
    ).toEqual(
      Object.values(currencies)
        .map((obj) => obj.iso_code)
        .filter((code) => !['AED', 'EUR'].includes(code))
    )
  })
})
