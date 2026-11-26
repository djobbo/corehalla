import type { Meta, StoryObj } from "@storybook/react-vite"
import { GuildStrongestMembers } from "./GuildStrongestMembers"
import { withRouter } from "@/storybook/decorators"
import {
    emptyRosterGuildEnvelope,
    guildEnvelope,
    unratedGuildEnvelope,
} from "@/storybook/fixtures"
import type { GuildMember } from "@crh/api-contract/schemas"

const ratedMember = (
    id: number,
    name: string,
    rating: number,
    peakRating: number,
    tier: string | null,
    region: string,
): GuildMember => ({
    id,
    name,
    slug: `${id}-${name.toLowerCase().replaceAll(" ", "-")}`,
    rank: "Member",
    joined_at: 1_700_000_000,
    xp: 1_000_000,
    ranked: { rating, peak_rating: peakRating, tier, region },
})

const fiveRated: readonly GuildMember[] = [
    ...guildEnvelope.data.members.filter((member) => member.ranked !== null),
    ratedMember(5, "Kor", 2_200, 2_330, null, "eu"),
    ratedMember(6, "Hattori", 1_990, 2_010, "Gold 5", "brz"),
]

const meta = {
    title: "Features/Guilds/Strongest members",
    component: GuildStrongestMembers,
    decorators: [withRouter],
    parameters: { layout: "padded" },
} satisfies Meta<typeof GuildStrongestMembers>

export default meta
type Story = StoryObj<typeof meta>

/** Five rated members; the unrated recruit on the same roster does not appear. */
export const FullFive: Story = {
    args: {
        members: [
            ...fiveRated,
            ...guildEnvelope.data.members.filter(
                (member) => member.ranked === null,
            ),
        ],
    },
}

/** A guild with two rated members lists both and pads nothing. */
export const FewerThanFive: Story = {
    args: {
        members: guildEnvelope.data.members
            .filter((member) => member.ranked !== null)
            .slice(0, 2),
    },
}

/** Nobody on the roster has a ranked record. */
export const NoneRated: Story = {
    args: { members: unratedGuildEnvelope.data.members },
}

export const EmptyRoster: Story = {
    args: { members: emptyRosterGuildEnvelope.data.members },
}

/**
 * Long names truncate at phone width instead of pushing the numbers out. The
 * card is 358px here: the page column left inside `.ch-page` at a 390px viewport.
 */
export const LongNamesNarrow: Story = {
    args: {
        members: [
            ratedMember(
                11,
                "BaronVonBubblewrapTheThirdOfHisName",
                2_311,
                2_404,
                null,
                "eu",
            ),
            ratedMember(
                12,
                "TheUnstoppableSandstormReturns",
                2_288,
                2_310,
                "Diamond",
                "us-e",
            ),
            ratedMember(
                13,
                "ScythesAndSorrowAndAlsoRegret",
                2_150,
                2_200,
                "Platinum 3",
                "brz",
            ),
            ratedMember(
                14,
                "MidnightMarauderOfTheNorthernReach",
                2_004,
                2_040,
                "Gold 5",
                "sea",
            ),
            ratedMember(15, "Cassidy", 1_980, 2_010, "Diamond", "jpn"),
        ],
    },
    parameters: { layout: "fullscreen" },
    render: (args) => (
        <div className="w-[358px] max-w-full">
            <GuildStrongestMembers {...args} />
        </div>
    ),
}
