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
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  Text,
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

  const { sdkClient } = useCoreSdkProvider()
  const { promotion, isLoading, mutatePromotion } = usePromotion(
    props.params.promotionId
  )

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
          <Card overflow='hidden'>
            Promotion is{' '}
            <Badge
              variant={promotion.active === true ? 'success' : 'secondary'}
              icon={promotion.active === true ? 'pulse' : undefined}
            >
              {promotion.active === true ? 'active' : 'disabled'}
            </Badge>
            <Button
              variant={promotion.active === true ? 'secondary' : 'primary'}
              onClick={() => {
                void sdkClient[promotion.type]
                  .update({
                    id: promotion.id,
                    _disable: promotion.active === true,
                    _enable: promotion.active !== true
                  })
                  .then(() => {
                    void mutatePromotion()
                  })
              }}
            >
              {promotion.active === true ? 'Disable' : 'Enable'}
            </Button>
          </Card>
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

function Info({ promotion }: { promotion: Promotion }): JSX.Element {
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
        ?? 15 ‒ 31 October 2023
      </ListDetailsItem>
      <ListDetailsItem label='Used'>?? 32 / 100</ListDetailsItem>
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
