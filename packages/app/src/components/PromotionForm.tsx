import {
  getPromotionConfigBySlug,
  type Promotion,
  type PromotionType,
  type promotionDictionary
} from '#data/dictionaries/promotion'
import { appRoutes } from '#data/routes'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputDate,
  Spacer,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { type z } from 'zod'

interface Props {
  promotionSlug: string
  promotionId?: string
  defaultValues?: Partial<
    z.infer<(typeof promotionDictionary)[PromotionType]['form']>
  >
}

export function PromotionForm({
  defaultValues,
  promotionId,
  promotionSlug
}: Props): React.ReactNode {
  const promotionConfig = getPromotionConfigBySlug(promotionSlug)

  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
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
      onSubmit={async (formValues) => {
        const resource = sdkClient[promotionConfig.type]
        let promotion: Promotion

        if (promotionId != null) {
          promotion = await resource.update({ id: promotionId, ...formValues })
        } else {
          promotion = await resource.create(formValues)

          await resource._disable(promotion.id)
        }

        setLocation(
          appRoutes.newPromotionRules.makePath({
            promotionSlug,
            promotionId: promotion.id
          })
        )
      }}
    >
      <Spacer top='8'>
        <HookedInput name='name' label='Name' />
      </Spacer>
      <Spacer top='8'>
        <HookedInput
          name='percentage'
          label='Percentage discount'
          hint={{
            text: 'How much the order subtotal is discounted in percentage.'
          }}
        />
      </Spacer>
      <Spacer top='8'>
        <Grid columns='2'>
          <HookedInputDate name='starts_at' label='Start on' />
          <HookedInputDate name='expires_at' label='Expires on' />
        </Grid>
      </Spacer>
      <Spacer top='8'>
        <Button type='submit' fullWidth>
          Continue to conditions
        </Button>
      </Spacer>
    </HookedForm>
  )
}
