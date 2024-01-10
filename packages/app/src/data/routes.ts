import { createRoute } from './route.utils'
export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute('/'),
  list: createRoute('/list/'),
  filters: createRoute('/filters/'),
  promotionDetails: createRoute('/list/:promotionId/'),
  editPromotion: createRoute('/list/:promotionId/edit/'),
  newSelectType: createRoute('/new/'),
  newPromotion: createRoute('/new/:promotionSlug/'),
  promotionConditions: createRoute('/list/:promotionId/conditions/'),
  newPromotionCondition: createRoute('/list/:promotionId/conditions/new/')
}
