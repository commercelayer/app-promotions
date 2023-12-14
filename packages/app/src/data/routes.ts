import { createRoute } from './route.utils'
export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute('/'),
  selectType: createRoute('/new/'),
  newPromotion: createRoute('/new/:promotionSlug/'),
  newPromotionEdit: createRoute('/new/:promotionSlug/:promotionId/'),
  newPromotionRules: createRoute('/new/:promotionSlug/:promotionId/rules/'),
  newPromotionRulesAdd: createRoute(
    '/new/:promotionSlug/:promotionId/rules/add/'
  )
}
