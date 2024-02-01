import type { Promotion } from '#data/dictionaries/promotion'
import { isMockedId, makePercentageDiscountPromotion } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { KeyedMutator } from 'swr'

export const promotionIncludeAttribute = [
  'promotion_rules',
  'coupons',
  'sku_list'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePromotion<Id extends string | undefined>(id: Id) {
  const { data, isLoading, mutate, isValidating, error } = useCoreApi(
    'promotions',
    'retrieve',
    id == null
      ? null
      : [
          id,
          {
            include: promotionIncludeAttribute
          }
        ],
    {
      isPaused: () => id != null && isMockedId(id),
      fallbackData:
        id != null ? (makePercentageDiscountPromotion() as any) : undefined
    }
  )

  return {
    promotion: data as unknown as undefined extends Id
      ? Promotion | undefined
      : Promotion,
    isLoading,
    mutatePromotion: mutate as unknown as KeyedMutator<Promotion>,
    isValidating,
    error
  }
}
