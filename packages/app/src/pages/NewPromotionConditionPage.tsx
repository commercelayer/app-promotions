import { type Promotion } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { matchers, ruleBuilderConfig } from '#data/ruleBuilder/config'
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
import { z } from 'zod'

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
          <MagicButton promotion={promotion} />
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

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never

type Push<T extends any[], V> = [...T, V]

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

const ruleFormValidator = z.object({
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

function MagicButton({
  promotion
}: {
  promotion: NonNullable<ReturnType<typeof usePromotion>['promotion']>
}): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <Button
      variant='secondary'
      onClick={() => {
        void (async () => {
          if (promotion.promotion_rules?.length === 0) {
            await sdkClient.custom_promotion_rules.create({
              promotion
            })
          }

          if (promotion.promotion_rules?.[0] != null) {
            await sdkClient.custom_promotion_rules.update({
              id: promotion.promotion_rules[0].id,
              filters: {
                market_id_in: 'robAnhPdGl,KoaJYhMVVj',
                currency_code_in: 'USD',
                // skus_count_gt: 3, // TODO: this is not filterable
                total_amount_cents_gteq: 50000,
                line_items_sku_tags_id_in: 'Yawgnfnmga',
                shipping_amount_cents_gteq: 0,
                // line_items_sku_tags_name_eq: 'winter-2023',
                // line_items_sku_tags_name_in: 'winter-2023,clothing',
                subtotal_amount_cents_gt: 30000
              }
            })
          }
        })()
      }}
    >
      Magic&nbsp;&nbsp;&nbsp;🪄
    </Button>
  )
}

export default Page
