import type { Promotion } from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  Badge,
  Button,
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
  formatDate,
  formatDateRange,
  getPromotionDisplayStatus,
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
            />
          ]}
        />
      }
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'All promotions',
        onClick() {
          setLocation(appRoutes.list.makePath({}))
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
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
            actionButton={
              <Link
                href={appRoutes.promotionConditions.makePath({
                  promotionId: promotion.id
                })}
              >
                Edit
              </Link>
            }
          >
            <ListDetailsItem label='??'>??</ListDetailsItem>
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
          statusDescription = `Disabled ${formatDate({
            isoDate: promotion.disabled_at,
            format: 'distanceToNow',
            timezone: user?.timezone
          })}`
        }
        break
      case 'active':
        statusDescription = `Expires in ${formatDate({
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })}`
        break
      case 'expired':
        statusDescription = `Expired ${formatDate({
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })}`
        break
      case 'upcoming':
        statusDescription = `Active in ${formatDate({
          isoDate: promotion.starts_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })}`
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
            <ListDetailsItem label='Discount'>
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
      <ListDetailsItem label='Activation period'>
        {formatDateRange({
          rangeFrom: promotion.starts_at,
          rangeTo: promotion.expires_at,
          timezone: user?.timezone
        })}
      </ListDetailsItem>
      {promotion.total_usage_limit != null && (
        <ListDetailsItem label='Used'>
          {promotion.total_usage_count} / {promotion.total_usage_limit}
        </ListDetailsItem>
      )}
      {promotion.exclusive === true && (
        <ListDetailsItem label='Exclusive'>
          <Text variant='success'>
            <Icon name='check' />
          </Text>
        </ListDetailsItem>
      )}
    </>
  )
}

export default Page
