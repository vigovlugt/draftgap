import { PrismaClient } from "@prisma/client";
import { MatchV5DTOs } from "twisted/dist/models-dto/matches/match-v5/match.dto";

function teamPositionToInt(teamPosition: MatchV5DTOs.Position) {
    if (teamPosition === "" || teamPosition === "Invalid") {
        throw new Error("Invalid team position");
    }

    return {
        TOP: 0,
        JUNGLE: 1,
        MIDDLE: 2,
        BOTTOM: 3,
        UTILITY: 4,
    }[teamPosition];
}

export async function storeMatches(
    db: PrismaClient,
    matches: MatchV5DTOs.MatchDto[]
) {
    for (const match of matches) {
        await db.match.create({
            data: {
                id: match.metadata.matchId,
                createdAt: new Date(match.info.gameCreation),
                duration: match.info.gameDuration,
                queueId: match.info.queueId,
                patch: match.info.gameVersion.split(".").slice(0, 2).join("."),
                participants: {
                    create: match.info.participants.map((participant) => ({
                        summoner: {
                            connectOrCreate: {
                                where: {
                                    puuid: participant.puuid,
                                },
                                create: {
                                    puuid: participant.puuid,
                                },
                            },
                        },
                        championKey: participant.championId,
                        teamPosition: teamPositionToInt(
                            participant.teamPosition
                        ),

                        blueTeam: participant.teamId === 100,
                        kills: participant.kills,
                        deaths: participant.deaths,
                        assists: participant.assists,

                        physicalDamageDealtToChampions:
                            participant.physicalDamageDealtToChampions,
                        magicDamageDealtToChampions:
                            participant.magicDamageDealtToChampions,
                        trueDamageDealtToChampions:
                            participant.trueDamageDealtToChampions,

                        physicalDamageTaken: participant.physicalDamageTaken,
                        magicDamageTaken: participant.magicDamageTaken,
                        trueDamageTaken: participant.trueDamageTaken,

                        goldEarned: participant.goldEarned,
                        totalMinionsKilled: participant.totalMinionsKilled,
                    })),
                },
            },
        });
    }
}

export async function setSummonerScraped(db: PrismaClient, puuid: string) {
    await db.summoner.update({
        where: { puuid },
        data: { scrapedAt: new Date() },
    });
}
