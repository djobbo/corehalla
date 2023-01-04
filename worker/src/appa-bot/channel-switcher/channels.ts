import { ChannelType, EmbedBuilder } from "discord.js"
import { deleteRoomNumber, getRoomNumber } from "./roomNumbers"
import { logInfo } from "logger"
import type { BotOptions } from ".."
import type {
    Channel,
    GuildChannel,
    TextChannel,
    VoiceChannel,
    VoiceState,
} from "discord.js"
import type { Client } from "reaccord"
import type { RankedRegion } from "bhapi/constants"

const isTextChannel = (channel?: Channel): channel is TextChannel =>
    !!channel && channel.type === ChannelType.GuildText

const getVoiceLogsChannel = (client: Client, options: BotOptions) => {
    const channel = client.channels.cache.get(
        options.channelSwitcher.logsChannelId,
    )
    if (!isTextChannel(channel)) return null
    return channel
}

const isParentLobbyCategory = (channel: GuildChannel, options: BotOptions) =>
    !!channel.parent?.name.startsWith(
        options.channelSwitcher.lobbyCategoryPrefix,
    )

const isGeneratorChannel = (
    channel: GuildChannel | null,
    options: BotOptions,
): channel is VoiceChannel =>
    !!channel &&
    channel.name.startsWith(options.channelSwitcher.generatorPrefix) &&
    isParentLobbyCategory(channel, options)

export const isLobbyChannel = (
    channel: GuildChannel | null,
    options: BotOptions,
): channel is VoiceChannel =>
    !!channel &&
    channel.name.startsWith(options.channelSwitcher.lobbyPrefix) &&
    !isGeneratorChannel(channel, options) &&
    isParentLobbyCategory(channel, options)

const getVoiceRtcRegionFromRegion = (region: Exclude<RankedRegion, "all">) => {
    switch (region) {
        case "me":
        case "eu":
            return "rotterdam"
        case "sea":
            return "singapore"
        case "brz":
            return "brazil"
        case "aus":
            return "sydney"
        case "us-w":
            return "us-west"
        case "jpn":
            return "japan"
        case "sa":
            return "southafrica"
        case "us-e":
        default:
            return "us-east"
    }
}

const getMemberPreferredRegionAndLanguage = (
    member: VoiceState["member"],
    options: BotOptions,
) => {
    const {
        channelSwitcher: { regionRolePrefix, languageRolePrefix },
    } = options
    const region =
        member?.roles.cache
            .find((role) => role.name.startsWith(regionRolePrefix))
            ?.name.slice(regionRolePrefix.length) ?? "us-e"
    const language =
        member?.roles.cache
            .find((role) => role.name.startsWith(languageRolePrefix))
            ?.name.slice(languageRolePrefix.length) ?? "en"

    return {
        region,
        language,
        rtcRegion: getVoiceRtcRegionFromRegion(
            region as Exclude<RankedRegion, "all">,
        ),
    }
}

const getLangDisplay = (language: string) => {
    switch (language) {
        case "fr":
            return "🇫🇷"
        case "de":
            return "🇩🇪"
        case "es":
            return "🇪🇸"
        case "ja":
            return "🇯🇵"
        default:
            return ""
    }
}

export const deleteChannelIfEmpty = async (
    voiceState: VoiceState,
    client: Client,
    options: BotOptions,
) => {
    const channel = voiceState.channel

    if (!isLobbyChannel(channel, options)) return

    const voiceLogsChannel = getVoiceLogsChannel(client, options)

    logInfo(
        "╭ " +
            `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has left [${channel.name}]`,
    )
    const embed = new EmbedBuilder() //
        .setTitle(channel.name)
        .addFields({
            name: "Événement",
            value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a quitté le salon`,
        })
        .setTimestamp(new Date())

    if (channel.members.size > 0) {
        logInfo(
            "╰ " +
                `  ${channel.members.size}/${channel.userLimit} users in channel\n`,
        )

        embed //
            .setColor("Orange")
            .setDescription(
                `${channel.members.size}/${channel.userLimit} joueurs restants`,
            )
            .addFields({
                name: "Joueurs",
                value: channel.members
                    .map((member) => `${member.user} (${member.user.id})`)
                    .join("\n"),
            })

        if (voiceLogsChannel) {
            voiceLogsChannel.send({ embeds: [embed] })
        }

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle(
                        `${voiceState.member?.user.tag} a quitté le salon`,
                    )
                    .setDescription(`id: ${voiceState.member?.user.id}`)
                    .setTimestamp(new Date()),
            ],
        })

        return
    }

    logInfo("╰ " + `  No users in channel => Deleting channel\n`)

    deleteRoomNumber(channel)
    await channel.delete()

    embed //
        .setDescription(`Aucun joueur restant, suppression du salon`)
        .setColor("Red")

    if (voiceLogsChannel) {
        voiceLogsChannel.send({ embeds: [embed] })
    }
}

export const cloneGeneratorChannel = async (
    voiceState: VoiceState,
    client: Client,
    options: BotOptions,
) => {
    const channel = voiceState.channel

    if (!isGeneratorChannel(channel, options)) return null

    if (!channel.parent) return null

    const { region, language, rtcRegion } = getMemberPreferredRegionAndLanguage(
        voiceState.member,
        options,
    )

    const voiceLogsChannel = getVoiceLogsChannel(client, options)

    const newChannelName = channel.name.slice(
        options.channelSwitcher.generatorPrefix.length,
    )

    const langDisplay = getLangDisplay(language)
    const regionDisplay = region.replace("-", "").toUpperCase()

    const genChannel = await channel.clone({
        name: `${options.channelSwitcher.lobbyPrefix}${langDisplay}${regionDisplay}-${newChannelName}`,
        parent: channel.parent,
        position: 999,
        rtcRegion,
    })

    logInfo(
        `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has created [${channel.name}]\n`,
    )

    if (voiceLogsChannel) {
        const embed = new EmbedBuilder() //
            .setTitle(channel.name)
            .addFields({
                name: "Événement",
                value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a créé le salon ${genChannel.name}`,
            })
            .setTimestamp(new Date())
            .setColor("Blue")
        voiceLogsChannel.send({ embeds: [embed] })
    }

    return genChannel
}

export const logUserJoinedVoiceChannel = async (
    voiceState: VoiceState,
    client: Client,
    options: BotOptions,
) => {
    const channel = voiceState.channel

    if (!isLobbyChannel(channel, options)) return

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor("Green")
                .setTitle(`${voiceState.member?.user.tag} a rejoint le salon`)
                .setDescription(`id: ${voiceState.member?.user.id}`)
                .setTimestamp(new Date()),
        ],
    })

    const roomNumber = getRoomNumber(channel)

    if (roomNumber) {
        channel.send(
            `${voiceState.member?.user}, Le numéro de la room est \`${roomNumber}\``,
        )
    }

    logInfo(
        "╭ " +
            `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has joined [${channel.name}]`,
    )
    logInfo(
        "╰ " +
            `  ${channel.members.size}/${channel.userLimit} users in channel\n`,
    )

    const voiceLogsChannel = getVoiceLogsChannel(client, options)

    if (voiceLogsChannel) {
        const embed = new EmbedBuilder() //
            .setTitle(channel.name)
            .setDescription(
                `${channel.members.size}/${channel.userLimit} joueurs`,
            )
            .addFields(
                {
                    name: "Événement",
                    value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a rejoint le salon`,
                },
                {
                    name: "Joueurs",
                    value: channel.members
                        .map((member) => `${member.user} (${member.user.id})`)
                        .join("\n"),
                },
            )
            .setTimestamp(new Date())
            .setColor("Green")
        voiceLogsChannel.send({ embeds: [embed] })
    }
}
