import { HookedInput } from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
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
