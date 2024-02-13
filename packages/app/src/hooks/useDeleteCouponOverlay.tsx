import { isMockedId } from '#mocks'
import {
  Button,
  PageHeading,
  SkeletonTemplate,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import { useState } from 'react'
import { makeCoupon } from 'src/mocks/resources/coupons'

interface OverlayHook {
  show: (coupon: Coupon) => void
  Overlay: React.FC<{ onClose: () => void }>
}

export function useDeleteCouponOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { sdkClient } = useCoreSdkProvider()
  const [coupon, setCoupon] = useState<Coupon>(makeCoupon())

  return {
    show: (coupon) => {
      setCoupon(coupon)
      open()
    },
    Overlay: ({ onClose }) => {
      return (
        <OverlayElement backgroundColor='light'>
          <SkeletonTemplate isLoading={isMockedId(coupon.id)}>
            <PageHeading
              title={`Confirm that you want to cancel the coupon with code ${coupon.code}`}
              navigationButton={{
                onClick: () => {
                  close()
                },
                label: 'Close',
                icon: 'x'
              }}
              description='This action cannot be undone, proceed with caution.'
            />

            <Button
              variant='danger'
              fullWidth
              onClick={() => {
                void sdkClient.coupons.delete(coupon.id).then(() => {
                  onClose()
                  close()
                })
              }}
            >
              Delete
            </Button>
          </SkeletonTemplate>
        </OverlayElement>
      )
    }
  }
}
