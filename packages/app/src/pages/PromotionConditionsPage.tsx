import { type PromotionRule } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { toFormLabels } from '#data/ruleBuilder/config'
import { usePromotion } from '#hooks/usePromotion'
import {
  Card,
  ListItem,
  PageLayout,
  RemoveButton,
  SkeletonTemplate,
  Spacer,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import type { ListableResourceType } from '@commercelayer/sdk/lib/cjs/api'
import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<typeof appRoutes.promotionConditions.params>
): JSX.Element | null {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion, mutatePromotion } = usePromotion(
    props.params.promotionId
  )

  return (
    <PageLayout
      title='Set conditions'
      description='Promotion applies only if all conditions are met.'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Cancel',
        icon: 'x',
        onClick() {
          setLocation(
            appRoutes.promotionDetails.makePath({
              promotionId: props.params.promotionId
            })
          )
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='10'>
          {promotion.promotion_rules?.map((promotionRule) => (
            <div key={promotionRule.id}>
              <PromotionRuleDetail
                onRemove={() => {
                  setTimeout(() => {
                    void mutatePromotion()
                  }, 1000)
                }}
                promotionRule={promotionRule}
              />
            </div>
          ))}
          <Spacer top='14'>
            <Link
              href={appRoutes.newPromotionCondition.makePath({
                promotionId: props.params.promotionId
              })}
            >
              <a>Add condition</a>
            </Link>
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

function PromotionRuleDetail({
  promotionRule,
  onRemove
}: {
  promotionRule: PromotionRule
  onRemove: () => void
}): JSX.Element | null {
  const formLabels = useMemo(() => toFormLabels(promotionRule), [promotionRule])

  switch (promotionRule.type) {
    case 'custom_promotion_rules':
      return (
        <div>
          {formLabels?.map((formLabel) => (
            <CustomPromotionRuleItem
              key={formLabel.predicate}
              onRemove={onRemove}
              customPromotionRule={promotionRule}
              formLabel={formLabel}
            />
          ))}
        </div>
      )
    default:
      return null
  }
}

function CustomPromotionRuleItem({
  formLabel,
  customPromotionRule,
  onRemove
}: {
  formLabel: NonNullable<ReturnType<typeof toFormLabels>>[number]
  customPromotionRule: CustomPromotionRule
  onRemove: () => void
}): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const label = `${formLabel.parameter} ${formLabel.operator ?? ''}`
  const values = formLabel.value.split(',')
  const handleRemove = formLabel.valid
    ? () => {
        void sdkClient.custom_promotion_rules.update({
          id: customPromotionRule.id,
          filters: {
            ...customPromotionRule.filters,
            [formLabel.predicate]: undefined
          }
        })

        onRemove()
        console.log('removing', formLabel.predicate, 'from filters')
      }
    : undefined
  if (formLabel.rel != null) {
    return (
      <ConditionItemWithRelationships
        rel={formLabel.rel}
        ids={values}
        label={label}
        onRemove={handleRemove}
      />
    )
  }

  return <ConditionItem label={label} onRemove={handleRemove} values={values} />
}

function ConditionItemWithRelationships({
  rel,
  label,
  ids,
  onRemove
}: {
  rel: Extract<ListableResourceType, 'markets' | 'tags'>
  label: string
  ids: string[]
  onRemove?: () => void
}): JSX.Element | null {
  const { data } = useCoreApi(
    rel,
    'list',
    [{ filters: { id_in: ids.join(',') } }],
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false
    }
  )

  return (
    <ConditionItem
      label={label}
      onRemove={onRemove}
      values={data?.map((d) => d.name) ?? []}
    />
  )
}

function ConditionItem({
  label,
  values,
  onRemove
}: {
  label: string
  values: string[]
  onRemove?: () => void
}): JSX.Element | null {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const handleRemove = useCallback(() => {
    setIsDeleting(true)
    onRemove?.()
  }, [onRemove])
  return (
    <Spacer top='2'>
      <Card overflow='hidden'>
        <ListItem tag='div' padding='none' borderStyle='none'>
          <div>
            {label}{' '}
            {values.map((value, i, list) => (
              <span key={value}>
                <b>{value}</b>
                {i < list.length - 1 ? <> or&nbsp;</> : null}
              </span>
            ))}
          </div>
          {onRemove != null && (
            <RemoveButton disabled={isDeleting} onClick={handleRemove} />
          )}
        </ListItem>
      </Card>
    </Spacer>
  )
}

export default Page
