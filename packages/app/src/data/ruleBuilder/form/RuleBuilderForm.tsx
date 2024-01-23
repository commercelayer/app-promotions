import { type Promotion } from '#data/dictionaries/promotion'
import { ruleBuilderConfig, type matchers } from '#data/ruleBuilder/config'
import { ruleBuilderFormValidator } from '#data/ruleBuilder/form/validator'
import { usePromotionRules } from '#data/ruleBuilder/usePromotionRules'
import {
  Button,
  HookedForm,
  HookedInputSelect,
  Spacer,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

export function RuleBuilderForm({
  promotion,
  onSuccess
}: {
  promotion: Promotion
  onSuccess: () => void
}): JSX.Element {
  const { rules } = usePromotionRules(promotion.promotion_rules)

  const methods = useForm<{
    parameter: keyof typeof ruleBuilderConfig | null
    operator: keyof typeof matchers | null
    value: string | string[] | null
  }>({
    defaultValues: {
      parameter: null,
      operator: null,
      value: null
    },
    resolver: zodResolver(ruleBuilderFormValidator),
    mode: 'all'
  })

  const { sdkClient } = useCoreSdkProvider()

  const watchParameter = methods.watch('parameter')

  const parameterInitialValues: InputSelectValue[] = useMemo(() => {
    return Object.entries(ruleBuilderConfig)
      .map(([value, { label, isVisible }]) =>
        isVisible(rules)
          ? {
              label,
              value
            }
          : undefined
      )
      .filter(isDefined)
  }, [rules])

  console.log(parameterInitialValues, rules)

  const operatorInitialValues: InputSelectValue[] = useMemo(() => {
    if (watchParameter == null) {
      return []
    }

    return (ruleBuilderConfig[watchParameter]?.operators.map(
      ({ label, value }) => ({
        label,
        value
      })
    ) ?? []) satisfies InputSelectValue[]
  }, [watchParameter])

  const component: JSX.Element | null = useMemo(() => {
    if (watchParameter == null) {
      return null
    }

    return ruleBuilderConfig[watchParameter]?.component() ?? null
  }, [watchParameter])

  useEffect(() => {
    methods.resetField('operator')
    methods.resetField('value')
  }, [watchParameter])

  return (
    <HookedForm
      {...methods}
      onSubmit={async (values): Promise<void> => {
        if (values.operator != null && values.parameter != null) {
          const config = ruleBuilderConfig[values.parameter]
          const promotionRules = promotion.promotion_rules ?? []

          if (config?.resource === 'custom_promotion_rules') {
            const customPromotionRule = promotionRules.find(
              (pr): pr is CustomPromotionRule =>
                pr.type === 'custom_promotion_rules'
            )

            const predicate = `${values.parameter}_${values.operator}`
            const newFilter = {
              [predicate]: Array.isArray(values.value)
                ? values.value?.join(',')
                : values.value
            }

            if (customPromotionRule != null) {
              await sdkClient.custom_promotion_rules.update({
                id: customPromotionRule.id,
                filters: {
                  ...customPromotionRule.filters,
                  ...newFilter
                }
              })
            } else {
              await sdkClient.custom_promotion_rules.create({
                promotion: { type: promotion.type, id: promotion.id },
                filters: newFilter
              })
            }

            onSuccess()

            console.log(newFilter, promotionRules, config)
          }
        }
      }}
    >
      <Spacer top='4'>
        <HookedInputSelect
          isSearchable={false}
          initialValues={parameterInitialValues}
          name='parameter'
        />
      </Spacer>
      {watchParameter != null && (
        <Spacer top='4'>
          <HookedInputSelect
            isSearchable={false}
            initialValues={operatorInitialValues}
            name='operator'
          />
        </Spacer>
      )}
      <Spacer top='4'>{component}</Spacer>
      <Spacer top='14'>
        <Button
          fullWidth
          type='submit'
          disabled={
            methods.formState.isSubmitting || !methods.formState.isValid
          }
        >
          Add condition
        </Button>
      </Spacer>
    </HookedForm>
  )
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value != null
}
