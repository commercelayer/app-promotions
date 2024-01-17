import { appRoutes } from '#data/routes'
import { usePromotionRules, type toFormLabels } from '#data/ruleBuilder/config'
import { usePromotion } from '#hooks/usePromotion'
import {
  ButtonCard,
  Card,
  ListItem,
  PageLayout,
  RemoveButton,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { CustomPromotionRule } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<typeof appRoutes.promotionConditions.params>
): JSX.Element | null {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { promotion, mutatePromotion } = usePromotion(props.params.promotionId)

  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)

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
      <SkeletonTemplate isLoading={isLoadingRules}>
        <Spacer top='10'>
          {rules?.map((formLabel) => {
            if (formLabel.promotionRule.type === 'custom_promotion_rules') {
              return (
                <div key={formLabel.predicate}>
                  <CustomPromotionRuleItem
                    key={formLabel.predicate}
                    onRemove={() => {
                      setTimeout(() => {
                        void mutatePromotion()
                      }, 1000)
                    }}
                    customPromotionRule={formLabel.promotionRule}
                    formLabel={formLabel}
                  />
                </div>
              )
            }

            return null
          })}
          <Spacer top='2'>
            <ButtonCard
              fullWidth
              iconLabel='Add condition'
              onClick={() => {
                setLocation(
                  appRoutes.newPromotionCondition.makePath({
                    promotionId: props.params.promotionId
                  })
                )
              }}
            />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
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

  return <ConditionItem label={label} onRemove={handleRemove} values={values} />
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
