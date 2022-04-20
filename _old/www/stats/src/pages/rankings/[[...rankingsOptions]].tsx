import type { IRanking1v1Format, RankedRegion } from '@corehalla/core/types'
import { GetServerSideProps } from 'next'
import Head from 'next/head'

import styles from '~styles/pages/RankingsPage.module.scss'

import { Rankings1v1Tab } from '~layout/pages/rankings/Rankings_1v1Tab'
import { TabsProvider, useTabs } from '~providers/TabsProvider'
import { getHostURL } from '~util/getHostURL'

import { Container } from '@Container'
import { Header } from '@Header'
import { Pagination } from '@Pagination'
import { Tabs } from '@Tabs'

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
            <Header />
            <Container>
                <div className={styles.paginationContainer}>
                    Regions here...
                    <Tabs<Bracket>
                        tabs={[
                            { title: '1v1', name: '1v1' },
                            { title: '2v2', name: '2v2' },
                            { title: 'Power 1v1', name: 'power1v1' },
                            { title: 'Power 2v2', name: 'power2v2' },
                        ]}
                    />
                    <Pagination
                        page={page}
                        getPageHref={(_page) => `/rankings/${bracket}/${region}/${_page}`}
                        firstPage={1}
                        span={1}
                    />
                </div>
                <Tab {...props} />
                <Pagination
                    page={page}
                    getPageHref={(_page) => `/rankings/${bracket}/${region}/${_page}`}
                    firstPage={1}
                    span={1}
                />
            </Container>
        </TabsProvider>
    )
}

export default RankingsPage

export const getServerSideProps: GetServerSideProps<
    Props,
    { rankingsOptions: [bracket: Bracket, region: RankedRegion, page: string] }
> = async ({ params, query, req }) => {
    const [bracket = '1v1', region = 'ALL', page = '1'] = params?.rankingsOptions || []

    const playerSearch = query.p?.toString() || ''

    try {
        const host = getHostURL(req)

        if (!host) throw new Error('Cannot find host')

        const res = await fetch(
            `${host}/api/rankings/${bracket}/${region}/${page}${playerSearch ? `?p=${playerSearch}` : ''}`,
        )

        const rankings = await res.json()

        if (!rankings) return { notFound: true }

        return {
            props: {
                bracket: bracket,
                region: region,
                page: parseInt(page),
                playerSearch,
                rankings,
            },
        }
    } catch (e) {
        console.log(e)
        return { notFound: true }
    }
}
