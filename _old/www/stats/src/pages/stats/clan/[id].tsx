import { fetchClanFormat } from '@corehalla/core'
import { MockClanStats } from '@corehalla/core/mocks'
import type { IClanFormat } from '@corehalla/core/types'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'

import { useOpenGraphImage } from '~hooks/useOpenGraphImage'
import { formatEpoch } from '~util'

import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import { ProfileHeader } from '@ProfileHeader'
import { StatDesc, StatLarge, StatSmall } from '@TextStyles'

interface Props {
    clanStats: IClanFormat
}

const PlayerStatsPage = ({ clanStats }: Props): JSX.Element => {
    const { ogImageURL } = useOpenGraphImage()
    return (
        <>
            <Head>
                <title>{clanStats.name} Stats • Corehalla</title>
                <meta name="description" content={`${clanStats.name} Stats`} />
                <meta property="og:title" content="Corehalla" />
                <meta property="og:description" content={`${clanStats.name} Stats`} />

                <meta property="og:image" content={ogImageURL} />
                <meta name="twitter:image" content={ogImageURL} />
            </Head>
            <Header content={`${clanStats.name} • Stats`} />
            <Container>
                <ProfileHeader
                    title={clanStats.name}
                    bannerURI="/images/backgrounds/Orion.jpg"
                    favorite={{
                        label: clanStats.name,
                        favorite_id: clanStats.id.toString(), // TODO: id is a number?
                        type: 'clan',
                        thumb_uri: `/images/icons/flags/Clanhalla.png`,
                    }}
                >
                    <>
                        <div>
                            <p>
                                <StatDesc>level</StatDesc>
                                <StatSmall>TBA</StatSmall>
                                <StatDesc>({clanStats.xp} xp)</StatDesc>
                            </p>
                            <p>
                                <StatDesc>Created </StatDesc>
                                <StatSmall>{formatEpoch(clanStats.creationDate)}</StatSmall>
                            </p>
                        </div>
                    </>
                </ProfileHeader>
                <h2>{clanStats.memberCount} Members</h2>
                <p>
                    xp currently in clan {clanStats.xpInClan} / {clanStats.xp}
                </p>
                <div>
                    {clanStats.members.map((member) => (
                        <div key={member.id}>
                            <StatLarge>{member.name}</StatLarge>
                            <StatDesc>{member.rank}</StatDesc>
                            <StatSmall>Joined on {formatEpoch(member.joinDate)}</StatSmall>
                        </div>
                    ))}
                </div>
            </Container>
            <Footer />
        </>
    )
}

export default PlayerStatsPage

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ params: { id } }) => {
    let clanStats: IClanFormat

    if (process.env.NODE_ENV === 'production') {
        clanStats = await fetchClanFormat(process.env.BH_API_KEY, parseInt(id))
    } else {
        clanStats = MockClanStats
    }

    if (!clanStats) return { notFound: true }

    return {
        props: {
            clanStats,
        },
    }
}
