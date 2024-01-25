import type { Promotion } from '#data/dictionaries/promotion'
import { type CurrencyCode } from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { InputCurrencyComponent } from './components/InputCurrencyComponent'
import { SelectCurrencyComponent } from './components/SelectCurrencyComponent'
import { SelectMarketComponent } from './components/SelectMarketComponent'
import { SelectTagComponent } from './components/SelectTagComponent'
import type { Rule } from './usePromotionRules'

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
} as const satisfies Record<string, { label: string; value: string }>

export const ruleBuilderConfig: RuleBuilderConfig = {
  market_id: {
    resource: 'custom_promotion_rules',
    rel: 'markets',
    label: 'Market',
    operators: [matchers.in, matchers.not_in],
    component: ({ promotion }) => (
      <SelectMarketComponent promotion={promotion} />
    ),
    isVisible({ rules }) {
      const isAlreadySet =
        rules.find((rule) => rule.valid && rule.configKey === 'market_id') !=
        null

      return !isAlreadySet
    }
  },
  currency_code: {
    resource: 'custom_promotion_rules',
    rel: undefined,
    label: 'Currency',
    operators: [matchers.in, matchers.not_in],
    component: ({ promotion }) => (
      <SelectCurrencyComponent promotion={promotion} />
    ),
    isVisible({ currencyCodes, rules }) {
      const marketIsSet =
        rules.find((rule) => rule.valid && rule.configKey === 'market_id') !=
        null
      const currencyIsSet = currencyCodes.length > 0

      return !marketIsSet && !currencyIsSet
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
    rel: undefined,
    label: 'Cart total',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isVisible({ currencyCodes, rules }) {
      const isAlreadySet =
        rules.find(
          (rule) => rule.valid && rule.configKey === 'total_amount_cents'
        ) != null

      return !isAlreadySet && currencyCodes.length === 1
    }
  },
  line_items_sku_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'SKU tag',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectTagComponent />,
    isVisible({ rules }) {
      const isAlreadySet =
        rules.find(
          (rule) => rule.valid && rule.configKey === 'line_items_sku_tags_id'
        ) != null

      return !isAlreadySet
    }
  },
  subtotal_amount_cents: {
    resource: 'custom_promotion_rules',
    rel: undefined,
    label: 'Cart subtotal',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isVisible({ currencyCodes, rules }) {
      const isAlreadySet =
        rules.find(
          (rule) => rule.valid && rule.configKey === 'subtotal_amount_cents'
        ) != null

      return !isAlreadySet && currencyCodes.length === 1
    }
  }
}

export type RuleBuilderConfig = Record<
  | 'market_id'
  | 'currency_code'
  | 'total_amount_cents'
  | 'line_items_sku_tags_id'
  | 'subtotal_amount_cents',
  {
    resource: 'custom_promotion_rules' | 'sku_list_promotion_rules'
    rel: Extract<ListableResourceType, 'markets' | 'tags'> | undefined
    label: string
    operators: Array<(typeof matchers)[keyof typeof matchers]>
    component: (props: { promotion: Promotion }) => React.ReactNode
    isVisible: (config: {
      rules: Rule[]
      currencyCodes: CurrencyCode[]
    }) => boolean
  }
>
