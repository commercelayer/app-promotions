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
                  <Route
                    path={appRoutes.home.path}
                    component={lazy(
                      async () => await import('#pages/HomePage')
                    )}
                  />
                  <Route
                    path={appRoutes.promotionList.path}
                    component={lazy(
                      async () => await import('#pages/PromotionListPage')
                    )}
                  />
                  <Route
                    path={appRoutes.filters.path}
                    component={lazy(
                      async () => await import('#pages/FiltersPage')
                    )}
                  />
                  <Route
                    path={appRoutes.promotionDetails.path}
                    component={lazy(
                      async () => await import('#pages/PromotionDetailsPage')
                    )}
                  />
                  <Route
                    path={appRoutes.editPromotion.path}
                    component={lazy(
                      async () => await import('#pages/EditPromotionPage')
                    )}
                  />
                  <Route
                    path={appRoutes.newSelectType.path}
                    component={lazy(
                      async () => await import('#pages/NewSelectTypePage')
                    )}
                  />
                  <Route
                    path={appRoutes.newPromotion.path}
                    component={lazy(
                      async () => await import('#pages/NewPromotionPage')
                    )}
                  />
                  <Route
                    path={appRoutes.newPromotionCondition.path}
                    component={lazy(
                      async () =>
                        await import('#pages/NewPromotionConditionPage')
                    )}
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
