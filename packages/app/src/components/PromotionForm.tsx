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
      onSubmit={async (formValues): Promise<void> => {
        const resource = sdkClient[promotionConfig.type]
        let promotion: Promotion

        if (promotionId != null) {
          // @ts-expect-error // TODO: I need to fix this
          promotion = await resource.update({ id: promotionId, ...formValues })
        } else {
          // @ts-expect-error // TODO: I need to fix this
          promotion = await resource.create({
            ...formValues,
            _disable: true
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
        </Section>
      </Spacer>
      <Spacer top='14'>
        <Section title='Promotion info'>
          <Spacer top='6'>
            <HookedInput
              name='percentage'
              label='Percentage discount'
              hint={{
                text: 'How much the order subtotal is discounted in percentage.'
              }}
            />
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
