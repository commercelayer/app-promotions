import {
  formValuesToPromotion,
  type Promotion,
  type PromotionType,
  type promotionDictionary
} from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedInputSelect,
  Section,
  Spacer,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { type z } from 'zod'

interface Props {
  promotionConfig: (typeof promotionDictionary)[keyof typeof promotionDictionary]
  promotionId?: string
  defaultValues?: Partial<
    z.infer<(typeof promotionDictionary)[PromotionType]['form']>
  >
}

export function PromotionForm({
  promotionConfig,
  defaultValues,
  promotionId
}: Props): React.ReactNode {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { promotion } = usePromotion(promotionId)
  const methods = useForm<z.infer<typeof promotionConfig.form>>({
    defaultValues,
    resolver: zodResolver(promotionConfig.form)
  })

  useEffect(
    function updateFormWithNewDefaultValues() {
      if (defaultValues != null) {
        methods.reset(defaultValues)
      }
    },
    [defaultValues?.name]
  )

  return (
    <HookedForm
      {...methods}
      onSubmit={async (formValues): Promise<void> => {
        const resource = sdkClient[promotionConfig.type]
        let promotion: Promotion

        if (promotionId != null) {
          // @ts-expect-error // TODO: I need to fix this
          promotion = await resource.update({
            id: promotionId,
            ...formValuesToPromotion(formValues)
          })
        } else {
          // @ts-expect-error // TODO: I need to fix this
          promotion = await resource.create({
            ...formValuesToPromotion(formValues),
            _disable: true,
            reference_origin: 'app-promotions'
          })
        }

        setLocation(
          appRoutes.promotionDetails.makePath({
            promotionId: promotion.id
          })
        )
      }}
    >
      <Spacer top='14'>
        <Section title='Basic info'>
          <Spacer top='6'>
            <HookedInput
              name='name'
              label='Name'
              hint={{ text: 'Pick a name that helps you identify it.' }}
            />
          </Spacer>
          <Spacer top='6'>
            <Grid columns='2'>
              <HookedInputDate name='starts_at' label='Start on' />
              <HookedInputDate name='expires_at' label='Expires on' />
            </Grid>
          </Spacer>

          {/* follows the promotion specific fields */}
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
        </Section>
      </Spacer>
      <Spacer top='14'>
        <Section title='Options'>
          <Spacer top='6'>
            <HookedInputCheckbox
              name='show_sku_list'
              checkedElement={
                <Spacer bottom='6'>
                  <HookedInputSelect
                    name='sku_list'
                    isClearable
                    hint={{
                      text: 'Apply the promotion only to the SKUs within the selected SKU list.'
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
                        : []
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
                </Spacer>
              }
            >
              Restrict to specific SKUs
            </HookedInputCheckbox>
          </Spacer>

          <Spacer top='2'>
            <HookedInputCheckbox
              name='show_total_usage_limit'
              checkedElement={
                <Spacer bottom='6'>
                  <HookedInput
                    type='number'
                    min={1}
                    name='total_usage_limit'
                    hint={{
                      text: 'How many times this promotion can be used.'
                    }}
                  />
                </Spacer>
              }
            >
              Limit usage
            </HookedInputCheckbox>
          </Spacer>
        </Section>
      </Spacer>
      <Spacer top='14'>
        <Spacer top='8'>
          <Button
            type='submit'
            fullWidth
            disabled={
              methods.formState.isSubmitting || !methods.formState.isValid
            }
          >
            {promotionId != null ? 'Update promotion' : 'Create promotion'}
          </Button>
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
