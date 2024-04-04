import { appRoutes } from '#data/routes'
import { useDeleteCouponOverlay } from '#hooks/useDeleteCouponOverlay'
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  Table,
  Td,
  Text,
  Th,
  Tooltip,
  Tr,
  formatDate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  coupons: Coupon[]
  promotionId: string
  onDelete: () => void
  boxed?: boolean
}

export const CouponTable = withSkeletonTemplate<Props>(
  ({ coupons, onDelete, promotionId, boxed = false }) => {
    const [, setLocation] = useLocation()
    const { user } = useTokenProvider()
    const { show: showDeleteCouponOverlay, Overlay: CouponOverlay } =
      useDeleteCouponOverlay()

    return (
      <>
        <CouponOverlay
          onClose={() => {
            onDelete()
          }}
        />
        <Table
          variant={boxed ? 'boxed' : undefined}
          thead={
            <Tr>
              <Th>Code</Th>
              <Th>Used</Th>
              <Th>Expiry</Th>
              <Th />
            </Tr>
          }
          tbody={
            <>
              {coupons.length === 0 && (
                <Tr>
                  <Td colSpan={4}>no results</Td>
                </Tr>
              )}
              {coupons?.map((coupon) => (
                <Tr key={coupon.id}>
                  <Td>
                    <Text
                      weight='semibold'
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}
                    >
                      {coupon.code}
                      {coupon.customer_single_use === true && (
                        <Tooltip
                          content={<>Single use per customer</>}
                          label={<Icon name='userRectangle' size={16} />}
                        />
                      )}
                    </Text>
                    {coupon.recipient_email != null && (
                      <Text
                        weight='semibold'
                        variant='info'
                        style={{ fontSize: '10px' }}
                      >
                        To: {coupon.recipient_email}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {coupon.usage_count}
                    {coupon.usage_limit != null
                      ? ` / ${coupon.usage_limit}`
                      : ''}
                  </Td>
                  <Td>
                    {coupon.expires_at == null
                      ? 'Never'
                      : formatDate({
                          format: 'distanceToNow',
                          isoDate: coupon.expires_at,
                          timezone: user?.timezone
                        })}
                  </Td>
                  <Td align='right'>
                    <Dropdown
                      dropdownItems={
                        <>
                          <DropdownItem
                            label='Edit'
                            onClick={() => {
                              setLocation(
                                appRoutes.editCoupon.makePath({
                                  promotionId,
                                  couponId: coupon.id
                                })
                              )
                            }}
                          />
                          <DropdownDivider />
                          <DropdownItem
                            label='Delete'
                            onClick={() => {
                              showDeleteCouponOverlay({
                                coupon,
                                deleteRule: coupons?.length === 1
                              })
                            }}
                          />
                        </>
                      }
                      dropdownLabel={<Icon name='dotsThree' size={24} />}
                    />
                  </Td>
                </Tr>
              ))}
            </>
          }
        />
      </>
    )
  }
)
