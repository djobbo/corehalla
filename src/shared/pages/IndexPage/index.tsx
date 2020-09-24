// Library imports
import React, { FC, useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { StatSmall, StatDesc } from '../../components/TextStyles';
import styled from 'styled-components';

// Components imports
import { LandingLayout } from '../../layout';
import { PlayerSearchContext } from '../../providers/PlayerSearchProvider';
import { devices } from '../../util/devices';
import { useScrollPosition } from '../../hooks/useScrollPosition';

const LandingNavbar = styled.nav<{ hasScrolled: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    transition: 0.25s all ease;

    & > ul {
        display: none;
    }

    ${({ hasScrolled }) =>
        hasScrolled &&
        `
        background-color: var(--bg);
        padding: 0.5rem 2rem;
    `}

    @media ${devices.desktop} {
        justify-content: space-between;
        & > ul {
            display: flex;
            align-items: center;

            & > a {
                margin-left: 2rem;
                color: var(--text);
            }
        }
    }
`;

const MainLogo = styled.img`
    height: 1.5rem;
`;

const LandingTitle = styled.h1`
    font-size: 3rem;
    color: var(--text);
    font-weight: normal;
    margin-bottom: 2rem;
`;

const LandingContentWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 3rem;
    z-index: 10;

    @media ${devices.desktop} {
        align-items: center;
    }
`;

const SearchInput = styled.input`
    background-color: var(--text);
    color: var(--bg);
    border-radius: 1rem;
    height: 2rem;
    outline: none;
    padding: 0 1rem;
    font-size: 1rem;
`;

const NavCTA = styled.a`
    padding: 0.25rem 0.75rem;
    background-color: var(--accent);
    color: var(--text);
    border-radius: 2rem;
`;

const MainContent = styled.div`
    margin-top: 100vh;
`;

const BlipsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    justify-items: center;
    padding: 2rem;
    gap: 4rem;
`;

const Blip = styled.p`
    max-width: 8rem;
`;

// const ScrollIndicator = styled.div`
//     position: absolute;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     text-align: center;
//     padding: 2rem;
//     margin: 1rem;
//     border: 1px solid var(--text-2);
// `;

export const IndexPage: FC = () => {
    const { setPlayerSearch } = useContext(PlayerSearchContext);
    const [hasScrolled, setHasScrolled] = useState(false);
    useScrollPosition(
        ({ currScrollPos }) => {
            setHasScrolled(currScrollPos > 0);
        },
        [hasScrolled],
    );

    return (
        <LandingLayout>
            <Helmet>
                <title>Index • Corehalla</title>
            </Helmet>
            <LandingNavbar hasScrolled={hasScrolled}>
                <MainLogo src="/assets/images/logo.png" alt="" />
                <ul>
                    <a href="#">Home</a>
                    <a href="#">Rankings</a>
                    <a href="#">Favorites</a>
                    <NavCTA href="#">Login</NavCTA>
                </ul>
            </LandingNavbar>
            {/* <ScrollIndicator>lol</ScrollIndicator> */}
            <LandingContentWrapper>
                <LandingTitle>Stats, Rankings & soon™ Wiki</LandingTitle>
                <SearchInput
                    type="text"
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="Search Player..."
                />
            </LandingContentWrapper>

            <MainContent>
                <BlipsContainer>
                    <Blip>
                        <StatSmall className="title">Rankings</StatSmall>
                        <br />
                        <StatDesc className="desc">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. At, itaque excepturi eius
                            repellendus atque.
                        </StatDesc>
                    </Blip>
                    <Blip>
                        <StatSmall className="title">Player Stats</StatSmall>
                        <br />
                        <StatDesc className="desc">
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel perspiciatis incidunt odio
                            sit.
                        </StatDesc>
                    </Blip>
                    <Blip>
                        <StatSmall className="title">Clan Stats</StatSmall>
                        <br />
                        <StatDesc className="desc">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus facere natus animi ut.
                        </StatDesc>
                    </Blip>
                </BlipsContainer>
            </MainContent>
        </LandingLayout>
    );
};
