import type { Promotion, PromotionRule } from '#data/dictionaries/promotion'
import {
  HookedInput,
  HookedInputSelect,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { useEffect, useState } from 'react'
import { currencies, type CurrencyCode } from './currencies'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePromotionRules(promotion: Promotion) {
  const { sdkClient } = useCoreSdkProvider()
  const [output, setOutput] = useState<{
    isLoading: boolean
    data: ReturnType<typeof toFormLabels>
  }>({ isLoading: true, data: null })
  useEffect(() => {
    if (
      promotion.promotion_rules == null ||
      promotion.promotion_rules.length === 0
    ) {
      setOutput({
        isLoading: false,
        data: null
      })
    } else {
      promotion.promotion_rules.forEach((promotionRule) => {
        const formLabels = toFormLabels(promotionRule)

        const data =
          formLabels?.flatMap(async (formLabel) => {
            if (formLabel.rel == null) {
              return formLabel
            }

            const promise = sdkClient[formLabel.rel]
              .list({
                filters: { id_in: formLabel.value.split(',').join(',') }
              })
              .then((data) => data.map((d) => d.name))
              .then((values) => ({
                ...formLabel,
                value: values.join(',')
              }))

            return await promise
          }) ?? []

        void Promise.all(data).then((data) => {
          setOutput({
            isLoading: false,
            data
          })
        })
      })
    }
  }, [promotion])

  return output
}

export function toFormLabels(promotionRule: PromotionRule): Array<{
  promotionRule: PromotionRule
  valid: boolean
  predicate: string
  parameter: keyof typeof ruleBuilderConfig
  rel?: Extract<ListableResourceType, 'markets' | 'tags'>
  operator?: string
  value: string
}> | null {
  switch (promotionRule.type) {
    case 'custom_promotion_rules':
      return Object.entries(promotionRule.filters ?? {}).map(
        ([predicate, value]) => {
          const regexp = new RegExp(
            `(?<matcher>${Object.keys(matchers)
              .map((matcher) => `_${matcher}`)
              .join('|')})`
          )
          const matcher = predicate
            .match(regexp)
            ?.groups?.matcher?.replace('_', '') as
            | keyof typeof matchers
            | undefined
          const parameter = predicate.replace(regexp, '')
          const valid = ruleBuilderConfig[parameter] != null
          return {
            promotionRule,
            valid,
            predicate,
            rel: ruleBuilderConfig[parameter]?.rel,
            parameter: ruleBuilderConfig[parameter]?.label ?? predicate,
            operator:
              valid && matcher != null ? matchers[matcher]?.label : undefined,
            value: value.toString()
          }
        }
      )

    default:
      return null
  }
}

export const matchers = {
  in: {
    label: 'is',
    value: 'in'
  },
  not_in: {
    label: 'is not',
    value: 'not_in'
  },
  eq: {
    label: 'is equal to',
    value: 'eq'
  },
  gteq: {
    label: 'is equal or greater than',
    value: 'gteq'
  },
  gt: {
    label: 'is greater than',
    value: 'gt'
  }
} as const

type RuleBuilderConfig = Record<
  string,
  {
    resource: 'custom_promotion_rules' | 'sku_list_promotion_rules'
    rel?: 'markets' | 'tags'
    label: string
    operators: Array<(typeof matchers)[keyof typeof matchers]>
    component: () => JSX.Element
  }
>

export const ruleBuilderConfig: RuleBuilderConfig = {
  market_id: {
    resource: 'custom_promotion_rules',
    rel: 'markets',
    label: 'Market',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectMarketComponent />
  },
  currency_code: {
    resource: 'custom_promotion_rules',
    label: 'Currency',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectCurrencyComponent />
  },
  itemsInCart: {
    resource: 'sku_list_promotion_rules',
    label: 'Items in cart',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: () => <HookedInput name='value' />
  },
  total_amount_cents: {
    resource: 'custom_promotion_rules',
    label: 'Cart total',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: () => <HookedInput name='value' />
  },
  line_items_sku_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'SKU tag',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectTagComponent />
  },
  subtotal_amount_cents: {
    resource: 'custom_promotion_rules',
    label: 'Cart subtotal',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: () => <HookedInput name='value' />
  }
}

function SelectMarketComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  return (
    <HookedInputSelect
      name='value'
      initialValues={[]}
      loadAsyncValues={async (value) => {
        const markets = await sdkClient.markets.list({
          filters: {
            name_cont: value
          }
        })

        return markets.map((market) => ({
          label: market.name,
          value: market.id
        }))
      }}
      isMulti
    />
  )
}

function SelectTagComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  return (
    <HookedInputSelect
      name='value'
      initialValues={[]}
      loadAsyncValues={async (value) => {
        const tags = await sdkClient.tags.list({
          filters: {
            name_cont: value
          }
        })

        return tags.map((tag) => ({
          label: tag.name,
          value: tag.id
        }))
      }}
      isMulti
    />
  )
}

function SelectCurrencyComponent(): JSX.Element {
  const currencyValues: InputSelectValue[] = Object.entries(currencies).map(
    ([code, currency]) => ({
      label: `${currency.name} (${code.toUpperCase()})`,
      value: code.toUpperCase()
    })
  )
  return (
    <HookedInputSelect name='value' initialValues={currencyValues} isMulti />
  )
}

/**
 * Get the list of currency codes given a `Promotion`.
 */
export function getCurrencyCodes(
  promotion: Promotion
): Array<Uppercase<CurrencyCode>> | null | undefined {
  const ccPromotionCurrencyCode = promotion.currency_code as
    | Uppercase<CurrencyCode>
    | null
    | undefined

  const ccPromotionMarket = promotion.market?.price_list?.currency_code as
    | Uppercase<CurrencyCode>
    | null
    | undefined

  const customPromotionRule = promotion.promotion_rules?.find(
    (pr): pr is CustomPromotionRule => pr.type === 'custom_promotion_rules'
  )

  const currencyCodeIn = customPromotionRule?.filters?.currency_code_in as
    | string
    | null
    | undefined

  const currencyCodeNotIn = customPromotionRule?.filters
    ?.currency_code_not_in as string | null | undefined

  const currencyCodeNotInAsArray =
    currencyCodeNotIn != null ? currencyCodeNotIn.split(',') : null

  const currencyCodeNotInList =
    currencyCodeNotInAsArray != null
      ? Object.values(currencies)
          .map((obj) => obj.iso_code)
          .filter((code) => !currencyCodeNotInAsArray.includes(code))
      : null

  const currencyCodes =
    ccPromotionCurrencyCode != null
      ? [ccPromotionCurrencyCode]
      : ccPromotionMarket != null
        ? [ccPromotionMarket]
        : currencyCodeIn != null
          ? (currencyCodeIn.split(',') as Array<Uppercase<CurrencyCode>>)
          : currencyCodeNotInList != null
            ? (currencyCodeNotInList as Array<Uppercase<CurrencyCode>>)
            : null

  return currencyCodes
}
