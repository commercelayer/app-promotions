import {
  PageLayout,
  SkeletonTemplate,
  useTokenProvider
} from '@commercelayer/app-elements'

function LoadingPage(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  return (
    <SkeletonTemplate isLoading>
      <PageLayout
        title={<SkeletonTemplate isLoading>Promotions</SkeletonTemplate>}
        mode={mode}
        gap='only-top'
        onGoBack={() => {}}
      >
        <div />
      </PageLayout>
    </SkeletonTemplate>
  )
}

export default LoadingPage
