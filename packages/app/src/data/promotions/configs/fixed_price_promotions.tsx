import {
  HookedInputCurrency,
  HookedInputSelect,
  ListItem,
  Spacer,
  currencies,
  type CurrencyCode
} from '@commercelayer/app-elements'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { PromotionSkuListSelector } from '../components/PromotionSkuListSelector'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  fixed_price_promotions: {
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
  }
} satisfies Pick<PromotionConfig, 'fixed_price_promotions'>
