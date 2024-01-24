import { z } from 'zod'
import { matchers, ruleBuilderConfig } from '../config'

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never

type Push<T extends any[], V> = [...T, V]

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

export const ruleBuilderFormValidator = z.object({
  parameter: z.enum(
    Object.keys(ruleBuilderConfig) as TuplifyUnion<
      keyof typeof ruleBuilderConfig
    >
  ),
  operator: z.enum(
    Object.keys(matchers) as TuplifyUnion<keyof typeof matchers>
  ),
  value: z.string().min(1).or(z.string().array()).or(z.number())
})
