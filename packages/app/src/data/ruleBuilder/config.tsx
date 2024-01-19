import type { Promotion, PromotionRule } from '#data/dictionaries/promotion'
import { HookedInput, useCoreSdkProvider } from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { SelectCurrencyComponent } from './components/SelectCurrencyComponent'
import { SelectMarketComponent } from './components/SelectMarketComponent'
import { SelectTagComponent } from './components/SelectTagComponent'
import { currencies, type CurrencyCode } from './currencies'

/**
 * Returns a standard format to identify all promotion rules so that it's easier to read and display them.
 */
export function usePromotionRules(
  promotionRules: Promotion['promotion_rules']
): {
  isLoading: boolean
  rules: Rule[]
} {
  const { sdkClient } = useCoreSdkProvider()
  const [output, setOutput] = useState<{
    isLoading: boolean
    rules: Rule[]
  }>({ isLoading: true, rules: [] })
  useEffect(() => {
    if (promotionRules == null || promotionRules.length === 0) {
      setOutput({
        isLoading: false,
        rules: []
      })
    } else {
      // The following code resolves the IDs inside `rawValue` when `rel` is set.
      const resolvedValues: Array<Promise<Rule>> = promotionRules.flatMap(
        (promotionRule) => {
          const rules = toRawRules(promotionRule)

          return (
            rules?.flatMap(async (rule) => {
              if (!rule.valid || rule.rel == null) {
                return {
                  ...rule,
                  value: rule.rawValue
                } satisfies Rule
              }

              const promise: Promise<Rule> = sdkClient[rule.rel]
                .list({
                  filters: { id_in: rule.rawValue.split(',').join(',') }
                })
                .then((data) => data.map((d) => d.name))
                .then((values) => ({
                  ...rule,
                  value: values.join(',')
                }))

              return await promise
            }) ?? []
          )
        }
      )

      void Promise.all(resolvedValues).then((data) => {
        setOutput({
          isLoading: false,
          rules: data
        })
      })
    }
  }, [promotionRules])

  return output
}

type RawRule = {
  key: string
  label: string
  rawValue: string
} & (
  | {
      /** Is valid when the promotion rule is managed by the configuration. False when unknown (not managed). */
      valid: false
    }
  | {
      /** Is valid when the promotion rule is managed by the configuration. False when unknown (not managed). */
      valid: true
      /** Rule builder configuration */
      config: (typeof ruleBuilderConfig)[keyof typeof ruleBuilderConfig]
      /** Related resource. (e.g. when `markets`, the `rawValue` contains market IDs) */
      rel?: Extract<ListableResourceType, 'markets' | 'tags'>
      /** Filter matcher. It represents the condition to be met by the query. */
      matcherLabel: (typeof matchers)[keyof typeof matchers]['label']
      /** Type from the associated promotion rule */
      type: CustomPromotionRule['type']
      /** The associated `PromotionRule`. */
      promotionRule: CustomPromotionRule

      /**
       * In a `CustomPromotionRule` filter the `predicate` indicates the filter key.
       * It's format is `{{attributes}}_{{matcher}}`,
       * where attributes is a set of one or more attributes and matcher represents the condition to be met by the query.
       * (e.g. `market_id_in`)
       */
      predicate: string
    }
)

export type Rule = { value: string } & RawRule

function toRawRules(promotionRule: PromotionRule): RawRule[] | null {
  switch (promotionRule.type) {
    case 'custom_promotion_rules':
      return Object.entries(promotionRule.filters ?? {}).map(
        ([predicate, rawValue]) => {
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
          const attributes = predicate.replace(regexp, '')

          const config = ruleBuilderConfig[attributes]
          const matcherLabel = matcher != null ? matchers[matcher].label : null
          if (config == null || matcherLabel == null) {
            return {
              valid: false,
              key: predicate,
              label: predicate,
              rawValue: rawValue.toString()
            } satisfies RawRule
          }

          return {
            valid: true,
            type: 'custom_promotion_rules',
            promotionRule,
            key: predicate,
            label: config.label,
            predicate,
            config,
            rel: config.rel,
            matcherLabel,
            rawValue: rawValue.toString()
          } satisfies RawRule
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
    rel?: Extract<ListableResourceType, 'markets' | 'tags'>
    label: string
    operators: Array<(typeof matchers)[keyof typeof matchers]>
    component: () => JSX.Element
    isVisible: (rules: Rule[]) => boolean
  }
>

export const ruleBuilderConfig: RuleBuilderConfig = {
  market_id: {
    resource: 'custom_promotion_rules',
    rel: 'markets',
    label: 'Market',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectMarketComponent />,
    isVisible() {
      return true
    }
  },
  currency_code: {
    resource: 'custom_promotion_rules',
    label: 'Currency',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectCurrencyComponent />,
    isVisible() {
      return true
    }
  },
  // itemsInCart: {
  //   resource: 'sku_list_promotion_rules',
  //   label: 'Items in cart',
  //   operators: [matchers.eq, matchers.gteq, matchers.gt],
  //   component: () => <HookedInput name='value' />
  // },
  total_amount_cents: {
    resource: 'custom_promotion_rules',
    label: 'Cart total',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: () => <HookedInput name='value' />,
    isVisible() {
      return true
    }
  },
  line_items_sku_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'SKU tag',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectTagComponent />,
    isVisible: () => true
  },
  subtotal_amount_cents: {
    resource: 'custom_promotion_rules',
    label: 'Cart subtotal',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: () => <HookedInput name='value' />,
    isVisible() {
      return true
    }
  }
}

/**
 * Get the list of currency codes given a `Promotion`.
 */
export function getCurrencyCodes(
  promotion: Promotion
): Array<Uppercase<CurrencyCode>> {
  const currencyCodeFromPromotion = promotion.currency_code as
    | Uppercase<CurrencyCode>
    | null
    | undefined

  const currencyCodeFromPromotionMarket = promotion.market?.price_list
    ?.currency_code as Uppercase<CurrencyCode> | null | undefined

  const customPromotionRule = promotion.promotion_rules?.find(
    (pr): pr is CustomPromotionRule => pr.type === 'custom_promotion_rules'
  )

  const currencyCodeInList = (
    customPromotionRule?.filters?.currency_code_in as string | null | undefined
  )?.split(',') as Array<Uppercase<CurrencyCode>> | null | undefined

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
  ) as Array<Uppercase<CurrencyCode>> | null | undefined

  const currencyCodes =
    currencyCodeFromPromotion != null
      ? [currencyCodeFromPromotion]
      : currencyCodeFromPromotionMarket != null
        ? [currencyCodeFromPromotionMarket]
        : currencyCodeInList ?? currencyCodeNotInList ?? []

  return currencyCodes
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never

type Push<T extends any[], V> = [...T, V]

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

export const ruleFormValidator = z.object({
  parameter: z.enum(
    Object.keys(ruleBuilderConfig) as TuplifyUnion<
      keyof typeof ruleBuilderConfig
    >
  ),
  operator: z.enum(
    Object.keys(matchers) as TuplifyUnion<keyof typeof matchers>
  ),
  value: z.string().min(1).or(z.string().array())
})
