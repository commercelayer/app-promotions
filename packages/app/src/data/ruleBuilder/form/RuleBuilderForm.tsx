import { type Promotion } from '#data/dictionaries/promotion'
import { isDefined } from '#data/isValid'
import {
  ruleBuilderConfig,
  type RuleBuilderConfig,
  type matchers
} from '#data/ruleBuilder/config'
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
import type { GroupedSelectValues } from '@commercelayer/app-elements/dist/ui/forms/InputSelect/InputSelect'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useCurrencyCodes } from '../currency'

export function RuleBuilderForm({
  promotion,
  onSuccess
}: {
  promotion: Promotion
  onSuccess: () => void
}): JSX.Element {
  const { inputParameter, methods, otherInputs, watchParameter } =
    useRuleBuilderFormFields(promotion)

  const { sdkClient } = useCoreSdkProvider()

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
          }
        }
      }}
    >
      <Spacer top='4'>{inputParameter}</Spacer>
      {watchParameter != null && (
        <>
          {otherInputs.map(([key, input]) => (
            <Spacer top='4' key={key}>
              {input}
            </Spacer>
          ))}
        </>
      )}
      <Spacer top='14'>
        <Button
          fullWidth
          type='submit'
          disabled={
            methods.formState.isSubmitting || !methods.formState.isValid
          }
        >
          Add
        </Button>
      </Spacer>
    </HookedForm>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useRuleBuilderFormFields(promotion: Promotion) {
  const { rules } = usePromotionRules(promotion)
  const { currencyCodes } = useCurrencyCodes(promotion)

  const methods = useForm<{
    parameter: keyof RuleBuilderConfig | null
    operator: keyof typeof matchers | null
    value: string | number | string[] | null
  }>({
    defaultValues: {
      parameter: null,
      operator: null,
      value: null
    },
    resolver: zodResolver(ruleBuilderFormValidator)
  })

  const watchParameter = methods.watch('parameter')

  const parameterInitialValues = useMemo<
    GroupedSelectValues | InputSelectValue[]
  >(() => {
    const inputSelectValues = Object.entries(ruleBuilderConfig)
      .map(([value, { label, isAvailable }]): InputSelectValue | null => {
        const isAlreadySet =
          rules.find((rule) => rule.valid && rule.configKey === value) != null
        return !isAlreadySet
          ? {
              label,
              value,
              isDisabled: !isAvailable({ currencyCodes, rules })
            }
          : null
      })
      .filter(isDefined)

    const availableOptions = inputSelectValues.filter(
      (v) => v.isDisabled !== true
    )

    const notAvailableOptions = inputSelectValues.filter(
      (v) => v.isDisabled === true
    )

    return [
      {
        label: 'Applicable',
        options: availableOptions
      },
      {
        label: 'Not applicable with current conditions',
        options: notAvailableOptions
      }
    ]
  }, [ruleBuilderConfig, currencyCodes, rules])

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

  const inputComponent: React.ReactNode | null = useMemo(() => {
    if (watchParameter == null) {
      return null
    }

    return (
      ruleBuilderConfig[watchParameter]?.component({
        promotion
      }) ?? null
    )
  }, [watchParameter, promotion])

  const inputOperator = (
    <HookedInputSelect
      isSearchable={false}
      initialValues={operatorInitialValues}
      name='operator'
    />
  )

  useEffect(() => {
    methods.resetField('operator')
    methods.resetField('value')
  }, [watchParameter])

  return {
    methods,
    watchParameter,
    inputParameter: (
      <HookedInputSelect
        isSearchable={false}
        initialValues={parameterInitialValues}
        name='parameter'
      />
    ),
    otherInputs: [
      ['operator', inputOperator],
      ['component', inputComponent]
    ] as const
  }
}
