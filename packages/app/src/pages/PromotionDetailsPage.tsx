import { GenericPageNotFound, type PageProps } from '#components/Routes'
import type { Promotion } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotionRules } from '#data/ruleBuilder/usePromotionRules'
import { useDeleteOverlay } from '#hooks/useDeleteOverlay'
import { usePromotion } from '#hooks/usePromotion'
import {
  Badge,
  Button,
  ButtonCard,
  Card,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  ListDetailsItem,
  ListItem,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  Text,
  formatDateRange,
  formatDateWithPredicate,
  getPromotionDisplayStatus,
  goBack,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useMemo } from 'react'
import { Link, useLocation } from 'wouter'

function Page(
  props: PageProps<typeof appRoutes.promotionDetails>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const { isLoading, promotion, error } = usePromotion(props.params.promotionId)

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {promotion.name}
        </SkeletonTemplate>
      }
      overlay={props.overlay}
      actionButton={<ActionButton promotion={promotion} />}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.home.makePath({})
          })
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='14'>
          <CardStatus promotionId={props.params.promotionId} />
        </Spacer>

        <Spacer top='14'>
          <SectionInfo promotion={promotion} />
        </Spacer>

        <Spacer top='14'>
          <SectionConditions promotionId={props.params.promotionId} />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

const ActionButton = withSkeletonTemplate<{
  promotion: Promotion
}>(({ promotion }) => {
  const [, setLocation] = useLocation()
  const { show: showDeleteOverlay, Overlay: DeleteOverlay } = useDeleteOverlay()

  return (
    <>
      <DeleteOverlay promotion={promotion} />
      <Dropdown
        dropdownItems={
          <>
            <DropdownItem
              label='Edit'
              onClick={() => {
                setLocation(
                  appRoutes.editPromotion.makePath({
                    promotionId: promotion.id
                  })
                )
              }}
            />
            <DropdownDivider />
            <DropdownItem
              label='Delete'
              onClick={() => {
                showDeleteOverlay()
              }}
            />
          </>
        }
      />
    </>
  )
})

const CardStatus = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { user } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { promotion, mutatePromotion } = usePromotion(promotionId)

  const displayStatus = useMemo(() => {
    // @ts-expect-error // TODO: we should fix this error type
    const displayStatus = getPromotionDisplayStatus(promotion)

    let statusDescription = ''
    switch (displayStatus.status) {
      case 'disabled':
        if (promotion.disabled_at != null) {
          statusDescription = formatDateWithPredicate({
            predicate: 'Disabled',
            isoDate: promotion.disabled_at,
            format: 'distanceToNow',
            timezone: user?.timezone
          })
        }
        break
      case 'active':
        statusDescription = formatDateWithPredicate({
          predicate: 'Expires',
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
      case 'expired':
        statusDescription = formatDateWithPredicate({
          predicate: 'Expired',
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
      case 'upcoming':
        statusDescription = formatDateWithPredicate({
          predicate: 'Active',
          isoDate: promotion.starts_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
    }

    return {
      ...displayStatus,
      isEnabled: displayStatus.status !== 'disabled',
      statusDescription
    }
  }, [promotion])

  return (
    <Card overflow='hidden'>
      <ListItem tag='div' borderStyle='none' padding='none' alignItems='top'>
        <div>
          <Text weight='semibold'>Promotion is</Text>{' '}
          <Badge
            style={{ verticalAlign: 'middle' }}
            variant={
              displayStatus.status === 'active' ? 'success' : 'secondary'
            }
            icon={displayStatus.isEnabled ? displayStatus.icon : undefined}
          >
            {displayStatus.label.toLowerCase()}
          </Badge>
          <br />
          <Text size='small'>{displayStatus.statusDescription}</Text>
        </div>
        <Button
          variant={displayStatus.isEnabled ? 'secondary' : 'primary'}
          onClick={() => {
            void sdkClient[promotion.type]
              .update({
                id: promotion.id,
                _disable: displayStatus.isEnabled,
                _enable: !displayStatus.isEnabled
              })
              .then(() => {
                void mutatePromotion()
              })
          }}
        >
          {displayStatus.isEnabled ? 'Disable' : 'Enable'}
        </Button>
      </ListItem>
    </Card>
  )
})

const SectionInfo = withSkeletonTemplate<{
  promotion: Promotion
}>(({ promotion }) => {
  const { user } = useTokenProvider()
  const specificDetails = useMemo(() => {
    switch (promotion.type) {
      case 'percentage_discount_promotions':
        return (
          <>
            <ListDetailsItem label='Discount' gutter='none'>
              {promotion.percentage}%
            </ListDetailsItem>
          </>
        )
      default:
        return null
    }
  }, [promotion])

  return (
    <Section title='Info'>
      {specificDetails}
      <ListDetailsItem label='Activation period' gutter='none'>
        {formatDateRange({
          rangeFrom: promotion.starts_at,
          rangeTo: promotion.expires_at,
          timezone: user?.timezone
        })}
      </ListDetailsItem>
      {promotion.sku_list != null && (
        <ListDetailsItem label='SKU list' gutter='none'>
          {promotion.sku_list.name}
        </ListDetailsItem>
      )}
      {promotion.total_usage_limit != null && (
        <ListDetailsItem label='Used' gutter='none'>
          {promotion.total_usage_count} / {promotion.total_usage_limit}
        </ListDetailsItem>
      )}
      {promotion.exclusive === true && (
        <ListDetailsItem label='Exclusive' gutter='none'>
          <Text variant='success'>
            <Icon name='check' />
          </Text>
        </ListDetailsItem>
      )}
      {promotion.priority != null && (
        <ListDetailsItem label='Custom priority' gutter='none'>
          {promotion.priority}
        </ListDetailsItem>
      )}
    </Section>
  )
})

const SectionConditions = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const {
    isLoading: isLoadingPromotion,
    promotion,
    mutatePromotion
  } = usePromotion(promotionId)
  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)

  const addConditionLink = appRoutes.newPromotionCondition.makePath({
    promotionId: promotion.id
  })

  return (
    <SkeletonTemplate isLoading={isLoadingPromotion || isLoadingRules}>
      <Section
        title='Conditions'
        border='none'
        actionButton={
          rules.length > 0 ? (
            <Link href={addConditionLink}>Add</Link>
          ) : undefined
        }
      >
        {rules.length > 0 ? (
          <Card backgroundColor='light' overflow='visible' gap='4'>
            {rules.map((rule, index) => (
              <Spacer key={rule.key} top={index > 0 ? '2' : undefined}>
                <Card overflow='visible' gap='4'>
                  <ListItem tag='div' padding='none' borderStyle='none'>
                    <div>
                      {rule.label} {rule.valid && `${rule.matcherLabel} `}
                      {rule.values.map((value, i, list) => (
                        <span key={value}>
                          <b>{value}</b>
                          {i < list.length - 1 ? <>,&nbsp;</> : null}
                        </span>
                      ))}
                    </div>
                    {rule.valid && rule.type === 'custom_promotion_rules' && (
                      <div>
                        <Dropdown
                          dropdownItems={
                            <>
                              <DropdownItem
                                label='Delete'
                                onClick={function () {
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
                              />
                            </>
                          }
                          dropdownLabel={<Icon name='dotsThree' size={24} />}
                        />
                      </div>
                    )}
                  </ListItem>
                </Card>
              </Spacer>
            ))}
          </Card>
        ) : (
          <ButtonCard
            icon='sliders'
            padding='6'
            fullWidth
            onClick={() => {
              setLocation(addConditionLink)
            }}
          >
            <Text align='left' variant='info'>
              <a>Add conditions</a> to limit the promotion to specific orders.
              <br />
              Promotion applies only if all conditions are met.
            </Text>
          </ButtonCard>
        )}
      </Section>
    </SkeletonTemplate>
  )
})

export default Page
