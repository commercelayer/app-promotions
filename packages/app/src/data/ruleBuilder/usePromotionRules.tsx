import { isMockedId } from '#mocks'
import type { Promotion, PromotionRule } from '#types'
import {
  formatCentsToCurrency,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { useEffect, useState } from 'react'
import { matchers, ruleBuilderConfig, type RuleBuilderConfig } from './config'
import { useCurrencyCodes } from './currency'

/**
 * Returns a standard format to identify all promotion rules so that it's easier to read and display them.
 */
export function usePromotionRules(promotion: Promotion): {
  isLoading: boolean
  rules: Rule[]
} {
  const { sdkClient } = useCoreSdkProvider()
  const { currencyCodes } = useCurrencyCodes(promotion)

  const [output, setOutput] = useState<{
    isLoading: boolean
    rules: Rule[]
  }>({ isLoading: true, rules: [] })

  useEffect(() => {
    if (isMockedId(promotion.id)) {
      return
    }

    if (
      promotion.promotion_rules == null ||
      promotion.promotion_rules.length === 0
    ) {
      setOutput({
        isLoading: false,
        rules: []
      })
    } else {
      // The following code resolves the IDs inside `rawValue` when `rel` is set.
      const resolvedValues: Array<Promise<Rule>> =
        promotion.promotion_rules.flatMap((promotionRule) => {
          const rules = toRawRules(promotionRule)

          return (
            rules?.flatMap(async (rule) => {
              if (rule.valid && rule.rel != null) {
                const promise: Promise<Rule> = sdkClient[rule.rel]
                  .list({
                    filters: { id_in: rule.rawValues.join(',') }
                  })
                  .then((data) => data.map((d) => d.name))
                  .then((values) => ({
                    ...rule,
                    values
                  }))

                return await promise
              }

              if (
                currencyCodes.length === 1 &&
                rule.valid &&
                (rule.configKey === 'subtotal_amount_cents' ||
                  rule.configKey === 'total_amount_cents')
              ) {
                return {
                  ...rule,
                  values: rule.rawValues.map((rawValue) =>
                    formatCentsToCurrency(
                      parseInt(rawValue),
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      currencyCodes[0]!
                    )
                  )
                } satisfies Rule
              }

              return {
                ...rule,
                values: rule.rawValues
              } satisfies Rule
            }) ?? []
          )
        })

      void Promise.all(resolvedValues).then((data) => {
        setOutput({
          isLoading: false,
          rules: data
        })
      })
    }
  }, [promotion, currencyCodes])

  return output
}

type RawRule = {
  key: string
  label: string
  rawValues: string[]
} & (
  | {
      /** Is valid when the promotion rule is managed by the configuration. False when unknown (not managed). */
      valid: false
    }
  | {
      /** Is valid when the promotion rule is managed by the configuration. False when unknown (not managed). */
      valid: true
      /** Rule builder configuration */
      configKey: keyof RuleBuilderConfig
      /** Rule builder configuration */
      config: RuleBuilderConfig[keyof RuleBuilderConfig]
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

export type Rule = { values: string[] } & RawRule

function toRawRules(promotionRule: PromotionRule): RawRule[] | null {
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

          const configKey = predicate.replace(
            regexp,
            ''
          ) as keyof RuleBuilderConfig

          const config = ruleBuilderConfig[configKey]
          const matcherLabel = matcher != null ? matchers[matcher].label : null
          if (config == null || matcherLabel == null) {
            return {
              valid: false,
              key: predicate,
              label: predicate,
              rawValues: value.toString().split(',')
            } satisfies RawRule
          }

          return {
            valid: true,
            type: promotionRule.type,
            promotionRule,
            key: predicate,
            label: config.label,
            predicate,
            configKey,
            config,
            rel: config.rel,
            matcherLabel,
            rawValues: value.toString().split(',')
          } satisfies RawRule
        }
      )

    default:
      return null
  }
}
