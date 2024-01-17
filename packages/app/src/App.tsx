import { ErrorNotFound } from '#pages/ErrorNotFound'
import LoadingPage from '#pages/LoadingPage'
import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { Suspense, lazy } from 'react'
import { SWRConfig } from 'swr'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

const HomePage = lazy(async () => await import('#pages/HomePage'))
const PromotionListPage = lazy(
  async () => await import('#pages/PromotionListPage')
)
const FiltersPage = lazy(async () => await import('#pages/FiltersPage'))
const PromotionDetailsPage = lazy(
  async () => await import('#pages/PromotionDetailsPage')
)
const EditPromotionPage = lazy(
  async () => await import('#pages/EditPromotionPage')
)
const NewSelectTypePage = lazy(
  async () => await import('#pages/NewSelectTypePage')
)
const NewPromotionPage = lazy(
  async () => await import('#pages/NewPromotionPage')
)
const PromotionConditionsPage = lazy(
  async () => await import('#pages/PromotionConditionsPage')
)
const NewPromotionConditionPage = lazy(
  async () => await import('#pages/NewPromotionConditionPage')
)

const isDev = Boolean(import.meta.env.DEV)
const basePath =
  import.meta.env.PUBLIC_PROJECT_PATH != null
    ? `/${import.meta.env.PUBLIC_PROJECT_PATH}`
    : undefined

export function App(): JSX.Element {
  return (
    <ErrorBoundary hasContainer>
      <SWRConfig
        value={{
          revalidateOnFocus: false
        }}
      >
        <TokenProvider
          kind='promotions'
          appSlug='promotions'
          domain={window.clAppConfig.domain}
          reauthenticateOnInvalidAuth={!isDev}
          devMode={isDev}
          loadingElement={<div />}
          organizationSlug={import.meta.env.PUBLIC_SELF_HOSTED_SLUG}
        >
          <MetaTags />
          <CoreSdkProvider>
            <Suspense fallback={<LoadingPage />}>
              <Router base={basePath}>
                <Switch>
                  <Route path={appRoutes.home.path} component={HomePage} />
                  <Route
                    path={appRoutes.list.path}
                    component={PromotionListPage}
                  />
                  <Route
                    path={appRoutes.filters.path}
                    component={FiltersPage}
                  />
                  <Route
                    path={appRoutes.promotionDetails.path}
                    component={PromotionDetailsPage}
                  />
                  <Route
                    path={appRoutes.editPromotion.path}
                    component={EditPromotionPage}
                  />
                  <Route
                    path={appRoutes.newSelectType.path}
                    component={NewSelectTypePage}
                  />
                  <Route
                    path={appRoutes.newPromotion.path}
                    component={NewPromotionPage}
                  />
                  <Route
                    path={appRoutes.promotionConditions.path}
                    component={PromotionConditionsPage}
                  />
                  <Route
                    path={appRoutes.newPromotionCondition.path}
                    component={NewPromotionConditionPage}
                  />
                  <Route component={ErrorNotFound} />
                </Switch>
              </Router>
            </Suspense>
          </CoreSdkProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
