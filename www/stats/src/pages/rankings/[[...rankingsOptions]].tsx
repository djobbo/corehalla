import { GetServerSideProps } from 'next'
import type { IRanking1v1Format, RankedRegion } from '@corehalla/types'
import { fetch1v1RankingsFormat } from '@corehalla/core'
import { Mock1v1Rankings } from '@corehalla/mocks'
import Head from 'next/head'
import { Rankings1v1Tab } from '~layout/pages/rankings/Rankings_1v1Tab'
import { TabsProvider, useTabs } from '~providers/TabsProvider'
import { Container } from '@Container'
import { Tabs } from '@Tabs'
import { Header } from '@Header'
import { Pagination } from '@Pagination'
import styles from '~styles/pages/RankingsPage.module.scss'

export interface Props {
    bracket: Bracket
    region: RankedRegion
    page: number
    playerSearch: string
    rankings: IRanking1v1Format[]
}

type Bracket = '1v1' | '2v2' | 'power1v1' | 'power2v2' // TODO: move this to @types

export interface IRankingsTabs {
    '1v1': RankedRegion | 'all'
    '2v2': RankedRegion | 'all'
    power1v1: null
    power2v2: null
}

const Tab = ({ rankings }: Props) => {
    const { tab } = useTabs<Bracket>()

    switch (tab) {
        case '1v1':
            return <Rankings1v1Tab rankings={rankings} />
        case '2v2':
            return <>2v2</>
        case 'power1v1':
            return <>Power 1v1</>
        case 'power2v2':
            return <>Power 2v2</>
        default:
            return <Rankings1v1Tab rankings={rankings} />
    }
}

const RankingsPage = (props: Props): JSX.Element => {
    const { bracket, page, region } = props

    return (
        <TabsProvider<Bracket> defaultTab="1v1">
            <Head>
                <title>
                    {region}-{bracket} Rankings | Page {page} • Corehalla
                </title>
            </Head>
            <Header
                content={
                    <Tabs<Bracket>
                        tabs={[
                            { title: '1v1', name: '1v1' },
                            { title: '2v2', name: '2v2' },
                            { title: 'Power 1v1', name: 'power1v1' },
                            { title: 'Power 2v2', name: 'power2v2' },
                        ]}
                    />
                }
            />
            <Container>
                <div className={styles.paginationContainer}>
                    Regions here...
                    <Pagination
                        page={page}
                        getPageHref={(_page) => `/rankings/${bracket}/${region}/${_page}`}
                        firstPage={1}
                        span={1}
                    />
                </div>
                <Tab {...props} />
            </Container>
        </TabsProvider>
    )
}

export default RankingsPage

export const getServerSideProps: GetServerSideProps<
    Props,
    { rankingsOptions: [bracket: Bracket, region: RankedRegion, page: string] }
> = async ({ params, query }) => {
    const [bracket, region, page] = params?.rankingsOptions || []

    const playerSearch = query.p?.toString() || ''

    let rankings: IRanking1v1Format[]

    // TODO: Switch Bracket 2v2 1v1power 2v2power

    if (process.env.NODE_ENV === 'production') {
        rankings = await fetch1v1RankingsFormat(process.env.BH_API_KEY, {
            page,
            region,
            name: playerSearch,
        })
    } else {
        rankings = Mock1v1Rankings
    }

    if (!rankings) return { notFound: true }

    return {
        props: {
            bracket: bracket || '1v1',
            region: region || 'ALL',
            page: parseInt(page || '1'),
            playerSearch,
            rankings,
        },
    }
}
