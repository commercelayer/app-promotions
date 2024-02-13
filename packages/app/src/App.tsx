import { Routes } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { SWRConfig } from 'swr'
import { Router } from 'wouter'

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
            <Router base={basePath}>
              <Routes
                routes={appRoutes}
                list={{
                  home: {
                    component: async () => await import('#pages/HomePage')
                  },
                  promotionList: {
                    component: async () =>
                      await import('#pages/PromotionListPage')
                  },
                  filters: {
                    component: async () => await import('#pages/FiltersPage')
                  },
                  promotionDetails: {
                    component: async () =>
                      await import('#pages/PromotionDetailsPage')
                  },
                  editPromotion: {
                    component: async () =>
                      await import('#pages/EditPromotionPage'),
                    overlay: true
                  },
                  newSelectType: {
                    component: async () =>
                      await import('#pages/NewSelectTypePage'),
                    overlay: true
                  },
                  newPromotion: {
                    component: async () =>
                      await import('#pages/NewPromotionPage'),
                    overlay: true
                  },
                  newPromotionCondition: {
                    component: async () =>
                      await import('#pages/NewPromotionConditionPage'),
                    overlay: true
                  },
                  newCoupon: {
                    component: async () => await import('#pages/NewCouponPage'),
                    overlay: true
                  },
                  editCoupon: {
                    component: async () =>
                      await import('#pages/EditCouponPage'),
                    overlay: true
                  }
                }}
              />
            </Router>
          </CoreSdkProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
