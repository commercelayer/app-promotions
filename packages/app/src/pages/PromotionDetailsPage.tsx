import type { Promotion } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotionRules } from '#data/ruleBuilder/config'
import { useDeleteOverlay } from '#hooks/useDeleteOverlay'
import { usePromotion } from '#hooks/usePromotion'
import {
  Badge,
  Button,
  ButtonCard,
  Card,
  Dropdown,
  DropdownItem,
  Icon,
  ListDetails,
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
  useTokenProvider
} from '@commercelayer/app-elements'
import { useMemo } from 'react'
import { Link, useLocation, type RouteComponentProps } from 'wouter'

function Page(
  props: RouteComponentProps<{ promotionId: string }>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const { promotion, isLoading } = usePromotion(props.params.promotionId)
  const { rules } = usePromotionRules(promotion)

  const { show: showDeleteOverlay, Overlay: DeleteOverlay } = useDeleteOverlay()

  const editConditionLink = appRoutes.promotionConditions.makePath({
    promotionId: promotion.id
  })

  // console.log('available currency codes', getCurrencyCodes(promotion))

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {promotion.name}
        </SkeletonTemplate>
      }
      actionButton={
        <Dropdown
          dropdownItems={[
            <DropdownItem
              key='edit'
              label='Edit'
              onClick={() => {
                setLocation(
                  appRoutes.editPromotion.makePath({
                    promotionId: props.params.promotionId
                  })
                )
              }}
            />,
            <DropdownItem
              key='delete'
              label='Delete'
              onClick={() => {
                showDeleteOverlay()
              }}
            />
          ]}
        />
      }
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
        <DeleteOverlay promotion={promotion} />
        <Spacer top='14'>
          <CardStatus promotionId={props.params.promotionId} />
        </Spacer>

        <Spacer top='14'>
          <ListDetails title='Info'>
            <Info promotion={promotion} />
          </ListDetails>
        </Spacer>

        <Spacer top='14'>
          <Section
            title='Conditions'
            border={rules.length > 0 ? undefined : 'none'}
            actionButton={
              rules.length > 0 ? (
                <Link href={editConditionLink}>Edit</Link>
              ) : undefined
            }
          >
            {rules.length > 0 ? (
              rules.map((rule) => (
                <ListDetailsItem key={rule.predicate} label={rule.parameter}>
                  {rule.value.split(',').join(', ')}
                </ListDetailsItem>
              ))
            ) : (
              <ButtonCard
                icon='sliders'
                padding='6'
                fullWidth
                onClick={() => {
                  setLocation(editConditionLink)
                }}
              >
                <Text align='left' variant='info'>
                  <a>Set conditions</a> to limit the promotion to specific
                  orders.
                  <br />
                  Promotion applies only if all conditions are met.
                </Text>
              </ButtonCard>
            )}
          </Section>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

function CardStatus({ promotionId }: { promotionId: string }): JSX.Element {
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
}

function Info({ promotion }: { promotion: Promotion }): JSX.Element {
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
    <>
      {specificDetails}
      <ListDetailsItem label='Activation period' gutter='none'>
        {formatDateRange({
          rangeFrom: promotion.starts_at,
          rangeTo: promotion.expires_at,
          timezone: user?.timezone
        })}
      </ListDetailsItem>
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
    </>
  )
}

export default Page
