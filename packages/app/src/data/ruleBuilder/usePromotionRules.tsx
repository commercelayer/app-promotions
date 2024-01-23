import type { Promotion, PromotionRule } from '#data/dictionaries/promotion'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { useEffect, useState } from 'react'
import { matchers, ruleBuilderConfig } from './config'

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
