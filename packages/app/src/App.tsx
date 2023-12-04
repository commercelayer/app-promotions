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
const SelectTypePage = lazy(async () => await import('#pages/SelectTypePage'))
const NewPromotionPage = lazy(
  async () => await import('#pages/NewPromotionPage')
)
const NewPromotionRulesPage = lazy(
  async () => await import('#pages/NewPromotionRulesPage')
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
                    path={appRoutes.selectType.path}
                    component={SelectTypePage}
                  />
                  <Route
                    path={appRoutes.newPromotion.path}
                    component={NewPromotionPage}
                  />
                  <Route
                    path={appRoutes.newPromotionEdit.path}
                    component={NewPromotionPage}
                  />
                  <Route
                    path={appRoutes.newPromotionRules.path}
                    component={NewPromotionRulesPage}
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
