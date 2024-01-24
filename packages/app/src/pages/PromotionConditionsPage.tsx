import { appRoutes } from '#data/routes'
import { usePromotionRules } from '#data/ruleBuilder/usePromotionRules'
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
  useTokenProvider,
  type GetParams
} from '@commercelayer/app-elements'
import { useCallback, useState } from 'react'
import { useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<GetParams<typeof appRoutes.promotionConditions>>
): JSX.Element | null {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
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
          {rules?.map((rule) => {
            if (!rule.valid) {
              return (
                <ConditionItem
                  key={rule.key}
                  label={rule.label}
                  values={rule.values}
                />
              )
            }

            if (rule.type === 'custom_promotion_rules') {
              return (
                <ConditionItem
                  key={rule.key}
                  label={`${rule.label} ${rule.matcherLabel}`}
                  onRemove={() => {
                    void sdkClient.custom_promotion_rules
                      .update({
                        id: rule.promotionRule.id,
                        filters: {
                          ...rule.promotionRule.filters,
                          [rule.predicate]: undefined
                        }
                      })
                      .then(async () => {
                        return await mutatePromotion()
                      })
                  }}
                  values={rule.values}
                />
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
