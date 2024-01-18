import { type Promotion } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import {
  ruleBuilderConfig,
  ruleFormValidator,
  type matchers
} from '#data/ruleBuilder/config'
import { usePromotion } from '#hooks/usePromotion'
import {
  Button,
  HookedForm,
  HookedInputSelect,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<typeof appRoutes.promotionConditions.params>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion } = usePromotion(props.params.promotionId)

  return (
    <PageLayout
      title='New condition'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          setLocation(
            appRoutes.promotionConditions.makePath({
              promotionId: props.params.promotionId
            })
          )
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='10'>
          <PromotionRuleForm
            promotion={promotion}
            onSuccess={() => {
              setLocation(
                appRoutes.promotionConditions.makePath({
                  promotionId: props.params.promotionId
                })
              )
            }}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function PromotionRuleForm({
  promotion,
  onSuccess
}: {
  promotion: Promotion
  onSuccess: () => void
}) {
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
    resolver: zodResolver(ruleFormValidator),
    mode: 'all'
  })

  const { sdkClient } = useCoreSdkProvider()

  const watchParameter = methods.watch('parameter')

  const parameterInitialValues: InputSelectValue[] = Object.entries(
    ruleBuilderConfig
  ).map(([value, { label }]) => ({
    label,
    value
  }))

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
      onSubmit={async (values) => {
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

export default Page
