import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import type { ListResponse } from '@commercelayer/sdk/lib/cjs/resource'
import type { KeyedMutator } from 'swr'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePromotionCoupons<Id extends string | undefined>(
  promotionId: Id
) {
  const { data, isLoading, mutate, isValidating, error } = useCoreApi(
    'promotions',
    'coupons',
    promotionId == null || isMockedId(promotionId)
      ? null
      : [
          promotionId,
          {
            sort: ['-updated_at'],
            pageNumber: 1,
            pageSize: 5
          }
        ]
  )

  return {
    coupons: data,
    isLoading,
    mutatePromotionCoupons: mutate as unknown as KeyedMutator<
      ListResponse<Coupon>
    >,
    isValidating,
    error
  }
}
