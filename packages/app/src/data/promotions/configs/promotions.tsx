import type { Promotion } from '#types'
import { type IconProps } from '@commercelayer/app-elements'
import type { ResourceTypeLock } from '@commercelayer/sdk/lib/cjs/api'
import type { Replace } from 'type-fest'
import { z } from 'zod'

export const genericPromotionOptions = z.object({
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

type Sanitize<PT extends PromotionType> = Replace<
  Replace<PT, '_promotions', ''>,
  '_',
  '-',
  { all: true }
>

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
