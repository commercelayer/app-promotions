import { appRoutes } from '#data/routes'
import {
  Icon,
  ListItem,
  PageLayout,
  Section,
  Spacer,
  Text,
  useTokenProvider,
  type IconProps
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function NewPage(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [_location, setLocation] = useLocation()

  return (
    <PageLayout
      title='Select type'
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        setLocation(appRoutes.home.makePath({}))
      }}
    >
      <Spacer top='10'>
        <Section titleSize='small' title='Preset'>
          <Link icon='stack' href='#'>Buy X Pay Y</Link>
          <Link icon='stack' href='#'>Fixed amount discount</Link>
          <Link icon='stack' href='#'>Fixed price</Link>
          <Link icon='stack' href='#'>Free gift</Link>
          <Link icon='truck' href='#'>Free shipping</Link>
          <Link icon='stack' href='#'>Percentage discount</Link>
        </Section>
      </Spacer>
      <Spacer top='10'>
        <Section titleSize='small' title='Custom'>
          <Link icon='stack' href='#'>External promotion</Link>
        </Section>
      </Spacer>
    </PageLayout>
  )
}

function Link({
  children,
  href,
  icon
}: {
  children: string
  href: string
  icon: IconProps['name']
}) {
  return (
    <ListItem tag='a' icon={<Icon name={icon} />} href={href}>
      <Text weight='semibold'>{children}</Text>
      <Icon name='caretRight' />
    </ListItem>
  )
}

export default NewPage
