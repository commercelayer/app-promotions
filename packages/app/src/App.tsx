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

const HomePage = lazy(() => import('#pages/HomePage'))
const NewPage = lazy(() => import('#pages/NewPage'))

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
                  <Route path={appRoutes.new.path} component={NewPage}/>
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
