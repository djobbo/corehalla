import { IPlayerClan, IPlayerClanFormat } from '~types'
import { cleanString } from '~util/cleanString'

export const formatClanStats = (clan?: IPlayerClan): IPlayerClanFormat | undefined => {
    if (!clan) return

    const { clan_id, clan_name, clan_xp, personal_xp } = clan
    return {
        id: clan_id,
        name: cleanString(clan_name),
        xp: clan_xp,
        personalXp: personal_xp,
    }
}
