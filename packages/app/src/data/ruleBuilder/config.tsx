import type { Promotion } from '#types'
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
} as const satisfies {
  [key in 'in' | 'not_in' | 'eq' | 'gteq' | 'gt']: {
    label: string
    value: key
  }
}

export const ruleBuilderConfig: RuleBuilderConfig = {
  market_id: {
    resource: 'custom_promotion_rules',
    rel: 'markets',
    label: 'Market',
    operators: [matchers.in, matchers.not_in],
    component: ({ promotion }) => (
      <SelectMarketComponent promotion={promotion} />
    ),
    isAvailable() {
      return true
    }
  },
  currency_code: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Currency',
    operators: [matchers.in, matchers.not_in],
    component: ({ promotion }) => (
      <SelectCurrencyComponent promotion={promotion} />
    ),
    isAvailable() {
      return true
    }
  },
  // skuListPromotionRule: {
  //   resource: 'sku_list_promotion_rules',
  //   rel: null,
  //   label: 'SKU list',
  //   operators: null,
  //   component: ({ promotion }) => (
  //     <SelectCurrencyComponent promotion={promotion} />
  //   ),
  //   isAvailable() {
  //     return true
  //   }
  // },
  line_items_sku_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'SKU tag',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectTagComponent />,
    isAvailable() {
      return true
    }
  },
  customer_tags_id: {
    resource: 'custom_promotion_rules',
    rel: 'tags',
    label: 'Customer tag',
    operators: [matchers.in, matchers.not_in],
    component: () => <SelectTagComponent />,
    isAvailable() {
      return true
    }
  },
  subtotal_amount_cents: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Cart subtotal',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isAvailable({ currencyCodes }) {
      return currencyCodes.length === 1
    }
  },
  total_amount_cents: {
    resource: 'custom_promotion_rules',
    rel: null,
    label: 'Cart total',
    operators: [matchers.eq, matchers.gteq, matchers.gt],
    component: ({ promotion }) => (
      <InputCurrencyComponent promotion={promotion} />
    ),
    isAvailable({ currencyCodes }) {
      return currencyCodes.length === 1
    }
  }
}

export type RuleBuilderConfig = Record<
  | 'market_id'
  | 'currency_code'
  | 'total_amount_cents'
  | 'line_items_sku_tags_id'
  | 'customer_tags_id'
  | 'subtotal_amount_cents',
  // | 'skuListPromotionRule',
  {
    resource: 'custom_promotion_rules' | 'sku_list_promotion_rules'
    rel: Extract<ListableResourceType, 'markets' | 'tags'> | null
    label: string
    operators: Array<(typeof matchers)[keyof typeof matchers]> | null
    component: (props: { promotion: Promotion }) => React.ReactNode
    isAvailable: (config: {
      rules: Rule[]
      currencyCodes: CurrencyCode[]
    }) => boolean
  }
>
