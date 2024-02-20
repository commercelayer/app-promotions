import {
  HookedInput,
  HookedInputCheckbox,
  HookedInputCurrency,
  HookedInputSelect,
  ListItem,
  Spacer,
  Text,
  currencies,
  useCoreApi,
  useCoreSdkProvider,
  type CurrencyCode,
  type IconProps,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type {
  BuyXPayYPromotion,
  CouponCodesPromotionRule,
  CustomPromotionRule,
  ExternalPromotion,
  FixedAmountPromotion,
  FixedPricePromotion,
  FreeGiftPromotion,
  FreeShippingPromotion,
  OrderAmountPromotionRule,
  PercentageDiscountPromotion,
  QueryParamsList,
  SkuListPromotionRule
} from '@commercelayer/sdk'
import type { ResourceTypeLock } from '@commercelayer/sdk/lib/cjs/api'
import { useFormContext } from 'react-hook-form'
import type { Replace } from 'type-fest'
import { z } from 'zod'

type Sanitize<PT extends PromotionType> = Replace<
  Replace<PT, '_promotions', ''>,
  '_',
  '-',
  { all: true }
>

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type Promotion = (
  | Omit<BuyXPayYPromotion, 'promotion_rules'>
  | Omit<ExternalPromotion, 'promotion_rules'>
  | Omit<FixedAmountPromotion, 'promotion_rules'>
  | Omit<FixedPricePromotion, 'promotion_rules'>
  | Omit<FreeGiftPromotion, 'promotion_rules'>
  | Omit<FreeShippingPromotion, 'promotion_rules'>
  | Omit<PercentageDiscountPromotion, 'promotion_rules'>
) & {
  promotion_rules?: PromotionRule[] | null
}

// TODO: this is a temporary fix. We should manage this kind of type directly into the SDK.
export type PromotionRule =
  | CustomPromotionRule
  | SkuListPromotionRule
  | CouponCodesPromotionRule
  | OrderAmountPromotionRule

export type PromotionType = Extract<ResourceTypeLock, `${string}_promotions`>
export type PromotionSlug = Sanitize<PromotionType>

export type PromotionDictionary = {
  [type in PromotionType]: {
    enable: boolean
    type: type
    slug: Sanitize<type>
    titleList: string
    titleNew: string
    icon: IconProps['name']
    formType: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny>
    Fields: React.FC<{ promotion?: Promotion }>
    Options: React.FC<{ promotion?: Promotion }>
  }
}

const genericPromotionOptions = z.object({
  name: z.string().min(1),
  starts_at: z.date(),
  expires_at: z.date(),
  total_usage_limit: z
    .number()
    .min(1)
    .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$|^$/))
    .nullish()
    .transform((p) =>
      p != null && p !== '' ? parseInt(p.toString()) : undefined
    ),
  exclusive: z.boolean().default(false),
  priority: z
    .number()
    .min(1)
    .or(z.string().regex(/^[1-9][0-9]+$|^[1-9]$|^$/))
    .nullish()
    .transform((p) =>
      p != null && p !== '' ? parseInt(p.toString()) : undefined
    )
})

export const promotionDictionary: PromotionDictionary = {
  buy_x_pay_y_promotions: {
    enable: false,
    type: 'buy_x_pay_y_promotions',
    slug: 'buy-x-pay-y',
    icon: 'stack',
    titleList: 'Buy X pay Y',
    titleNew: 'buy X pay Y',
    formType: genericPromotionOptions.merge(
      z.object({
        x: z.number(),
        y: z.number(),
        sku_list: z.string().optional()
      })
    ),
    Fields: () => <></>,
    Options: () => <></>
  },
  external_promotions: {
    enable: false,
    type: 'external_promotions',
    slug: 'external',
    icon: 'linkSimple',
    titleList: 'External promotion',
    titleNew: 'external promotion',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>
  },
  fixed_amount_promotions: {
    enable: false,
    type: 'fixed_amount_promotions',
    slug: 'fixed-amount',
    icon: 'currencyEur',
    titleList: 'Fixed amount discount',
    titleNew: 'fixed amount discount',
    formType: genericPromotionOptions.merge(
      z.object({
        fixed_amount_cents: z
          .string()
          .min(1)
          .transform((p) => parseInt(p))
      })
    ),
    Fields: () => <></>,
    Options: () => <></>
  },
  fixed_price_promotions: {
    enable: true,
    type: 'fixed_price_promotions',
    slug: 'fixed-price',
    icon: 'pushPin',
    titleList: 'Fixed price',
    titleNew: 'fixed price',
    formType: genericPromotionOptions.merge(
      z.object({
        sku_list: z.string(),
        fixed_amount_cents: z
          .string()
          .or(z.number())
          .transform((p) => parseInt(p.toString())),
        currency_code: z.string()
      })
    ),
    Fields: ({ promotion }) => {
      const { watch } = useFormContext()
      const watchedCurrencyCode = watch('currency_code')

      console.log('watchedCurrencyCode', watchedCurrencyCode)

      const currencyCode: CurrencyCode =
        watchedCurrencyCode ??
        (promotion?.currency_code as CurrencyCode) ??
        'USD'

      return (
        <>
          <Spacer top='6'>
            <PromotionSkuListSelector
              promotion={promotion}
              label='SKU list'
              hint='Impose a fixed price to the SKUs within this list.'
            />
          </Spacer>
          <Spacer top='6'>
            <ListItem
              tag='div'
              padding='none'
              borderStyle='none'
              alignItems='top'
            >
              <HookedInputCurrency
                name='fixed_amount_cents'
                currencyCode={currencyCode}
                label='Fixed price'
                hint={{
                  text: 'The price of the SKUs in the list.'
                }}
              />
              <HookedInputSelect
                name='currency_code'
                label='&nbsp;'
                placeholder=''
                initialValues={Object.entries(currencies).map(([code]) => ({
                  label: code.toUpperCase(),
                  value: code.toUpperCase()
                }))}
              />
            </ListItem>
          </Spacer>
        </>
      )
    },
    Options: () => <></>
  },
  free_gift_promotions: {
    enable: false,
    type: 'free_gift_promotions',
    slug: 'free-gift',
    icon: 'gift',
    titleList: 'Free gift',
    titleNew: 'free gift',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>
  },
  free_shipping_promotions: {
    enable: true,
    type: 'free_shipping_promotions',
    slug: 'free-shipping',
    icon: 'truck',
    titleList: 'Free shipping',
    titleNew: 'free shipping',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>
  },
  percentage_discount_promotions: {
    enable: true,
    type: 'percentage_discount_promotions',
    slug: 'percentage-discount',
    icon: 'percent',
    titleList: 'Percentage discount',
    titleNew: 'percentage discount',
    formType: genericPromotionOptions.merge(
      z.object({
        percentage: z
          .string()
          .refine(
            (value) => /^[1-9][0-9]?$|^100$/.test(value),
            'Enter a valid number between 1 and 100'
          )
          .or(z.number().min(1).max(100))
          .transform((p) => parseInt(p.toString())),
        sku_list: z.string().nullish()
      })
    ),
    Fields: () => (
      <>
        <Spacer top='6'>
          <HookedInput
            type='number'
            min={1}
            max={100}
            name='percentage'
            label='Percentage discount'
            hint={{
              text: 'How much the order is discounted in percentage.'
            }}
          />
        </Spacer>
      </>
    ),
    Options: ({ promotion }) => {
      return (
        <>
          <Spacer top='2'>
            <HookedInputCheckbox
              name='show_sku_list'
              checkedElement={
                <Spacer bottom='6'>
                  <PromotionSkuListSelector
                    promotion={promotion}
                    hint='Apply the promotion only to the SKUs within the selected SKU list.'
                  />
                </Spacer>
              }
            >
              <Text weight='semibold'>Restrict to specific SKUs</Text>
            </HookedInputCheckbox>
          </Spacer>
        </>
      )
    }
  }
}

const PromotionSkuListSelector: React.FC<{
  label?: string
  hint: string
  promotion?: Promotion
}> = ({ hint, label, promotion }) => {
  const { sdkClient } = useCoreSdkProvider()

  const { data: skuLists = [] } = useCoreApi('sku_lists', 'list', [
    getParams({ name: '' })
  ])

  return (
    <HookedInputSelect
      name='sku_list'
      label={label}
      isClearable
      hint={{
        text: hint
      }}
      placeholder='Search...'
      initialValues={
        promotion?.sku_list != null
          ? [
              {
                label: promotion.sku_list.name,
                value: promotion.sku_list.id
              }
            ]
          : toInputSelectValues(skuLists)
      }
      loadAsyncValues={async (name) => {
        const skuLists = await sdkClient.sku_lists.list({
          pageSize: 25,
          filters: {
            name_cont: name
          }
        })

        return skuLists.map(({ name, id }) => ({
          label: name,
          value: id
        }))
      }}
    />
  )
}

function getParams({ name }: { name: string }): QueryParamsList {
  return {
    pageSize: 25,
    sort: {
      name: 'asc'
    },
    filters: {
      name_cont: name
    }
  }
}

function toInputSelectValues(
  items: Array<{ name: string; id: string }>
): InputSelectValue[] {
  return items.map(({ name, id }) => ({
    label: name,
    value: id
  }))
}

// HELPER

export function getPromotionConfigBySlug(
  promotionSlug: string
): (typeof promotionDictionary)[PromotionType] | null {
  const configuration = Object.values(promotionDictionary).find(
    (v) => v.slug === promotionSlug
  )

  return configuration ?? null
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function promotionToFormValues(promotion?: Promotion) {
  if (promotion == null) {
    return undefined
  }

  return {
    ...promotion,
    starts_at: new Date(promotion.starts_at),
    expires_at: new Date(promotion.expires_at),
    show_sku_list: promotion.sku_list != null,
    show_total_usage_limit: promotion.total_usage_limit != null,
    show_priority: promotion.priority != null,
    sku_list: promotion.sku_list?.id
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function formValuesToPromotion(
  formValues?: z.infer<
    (typeof promotionDictionary)[keyof typeof promotionDictionary]['formType']
  >
) {
  if (formValues == null) {
    return undefined
  }

  return {
    ...formValues,
    total_usage_limit:
      'total_usage_limit' in formValues && formValues.total_usage_limit != null
        ? formValues.total_usage_limit
        : null,
    priority:
      'priority' in formValues && formValues.priority != null
        ? formValues.priority
        : null,
    sku_list: {
      type: 'sku_lists',
      id:
        'sku_list' in formValues && formValues.sku_list != null
          ? formValues.sku_list
          : null
    }
  }
}
