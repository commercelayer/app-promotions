export type AppRoute = keyof typeof appRoutes
import type { Simplify } from 'type-fest'

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute('/'),
  new: createRoute('/new/')
}

export function createRoute<Path extends `/${string}/` | `/`, Variables extends Record<string, any> = ExtractVariables<Path>>(path: ValidPath<Variables, Path>) {
  return {
    path: '/' + path
      .replace(/\/+$/g, '')
      .replace(/^\/+/g, '') as Path extends `/${infer P}/` ? `/${P}` : '/',
    makePath: (variables: Variables, queryParameters?: string) => {
      const placeholderRegex = /:(\w+)[?]?/g

      const newPath = '/' + path
        .replace(placeholderRegex, (match, placeholder) => {
          const value = placeholder in variables ? variables[placeholder as keyof typeof variables] as string : null
          return value ?? match
        })
        .replace(placeholderRegex, '')
        .replace(/\/+$/g, '')
        .replace(/^\/+/g, '')

      return `${newPath}${hasQueryParameters(queryParameters) ? `?${queryParameters}` : ''}`
    }
  }
}

export const createTypedRoute = <Variables extends Record<string, any>>() => <Path extends `/${string}/` | `/`>(path: ValidPath<Variables, Path>) => {
  return createRoute<Path, Variables>(path)
}

function hasQueryParameters(queryParameters?: string): queryParameters is string {
  return Array.from(new URLSearchParams(queryParameters)).length > 0
}

type ExtractVariables<Path extends string> =
  Path extends `${string}:${infer Var}/${infer Rest}`
  ? Simplify<FixOptional<{ [key in Var]: string | number | boolean }> & ExtractVariables<Rest>>
  : {}

type FixOptional<T extends Record<string, any>> = Omit<T, `${string}?`> & {
  [K in keyof T as K extends `${infer VariableName}?` ? VariableName : never]?: T[K]
}

type ErrorVariables<Variables extends Record<string, any>, Path extends string> = keyof (
  {
    [key in keyof ExtractVariables<Path> as (key extends keyof Variables ? never : undefined extends ExtractVariables<Path>[key] ? key extends string ? `${key}?` : key : key)]-?: 'Is not properly set.'
  } & {
    [key in keyof Variables as (key extends string ? Path extends `${string}/:${key}${undefined extends Variables[key] ? '?' : ''}/${string}` ? never : undefined extends Variables[key] ? `${key}?` : key : never)]-?: 'Is not properly set.'
  }
)

type ValidPath<Variables extends Record<string, any>, Path extends string> = ErrorVariables<Variables, Path> extends never ? Path : `Missing variable '${ErrorVariables<Variables, Path> extends string ? ErrorVariables<Variables, Path> : 'unknown'}'`
