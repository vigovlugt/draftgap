export type LolChampSelectChampSelectSession = {
    actions: LolChampSelectChampSelectAction[][];
    allowBattleBoost: boolean;
    allowDuplicatePicks: boolean;
    allowLockedEvents: boolean;
    allowSkinSelection: boolean;
    bans: LolChampSelectChampSelectBannedChampion[];
    benchChampionIds: number[];
    benchEnabled: boolean;
    boostableSkinCount: number;
    chatDetails: LolChampSelectChampSelectChatRoomDetails;
    counter: number;
    entitledFeatureState: LolChampSelectChampSelectEntitledFeatureState;
    gameId: number;
    hasSimultaneousBans: boolean;
    hasSimultaneousPicks: boolean;
    isCustomGame: boolean;
    isSpectating: boolean;
    localPlayerCellId: number;
    lockedEventIndex: number;
    myTeam: LolChampSelectChampSelectPlayerSelection[];
    recoveryCounter: number;
    rerollsRemaining: number;
    skipChampionSelect: boolean;
    theirTeam: LolChampSelectChampSelectPlayerSelection[];
    timer: LolChampSelectChampSelectTimer;
    trades: LolChampSelectChampSelectTradeContract[];
};

export type LolChampSelectChampSelectAction = {
    actorCellId: number;
    championId: number;
    completed: boolean;
    id: number;
    isAllyAction: boolean;
    isInProgress: boolean;
    pickTurn: number;
    type: string;
};

export type LolChampSelectChampSelectBannedChampion = {
    myTeamBans: number[];
    numBans: number;
    theirTeamBans: number[];
};

export type LolChampSelectChampSelectChatRoomDetails = {
    chatRoomName: string;
    chatRoomPassword: string;
};

export type LolChampSelectChampSelectEntitledFeatureState = {
    additionalRerolls: number;
    unlockedSkinIds: number[];
};

export type LolChampSelectChampSelectPlayerSelection = {
    assignedPosition: string;
    cellId: number;
    championId: number;
    championPickIntent: number;
    entitledFeatureType: string;
    nameVisibilityType: string;
    obfuscatedPuuid: string;
    obfuscatedSummonerId: number;
    puuid: string;
    selectedSkinId: number;
    spell1Id: number;
    spell2Id: number;
    summonerId: number;
    team: number;
    wardSkinId: number;
};

export type LolChampSelectChampSelectTimer = {
    adjustedTimeLeftInPhase: number;
    internalNowInEpochMs: number;
    isInfinite: boolean;
    phase: string;
    totalTimeInPhase: number;
};

export type LolChampSelectChampSelectTradeContract = {
    cellId: number;
    id: number;
    state:
        | "AVAILABLE"
        | "BUSY"
        | "INVALID"
        | "RECEIVED"
        | "SENT"
        | "DECLINED"
        | "CANCELLED"
        | "ACCEPTED";
};

// lol-summoner/v1/current-summoner

export type LolSummonerSummoner = {
    accountId: string;
    displayName: string;
    internalName: string;
    nameChangeFlag: boolean;
    percentCompleteForNextLevel: number;
    privacy: string;
    profileIconId: number;
    puuid: string;
    rerollPoints: LolSummonerRerollPoints;
    summonerId: number;
    summonerLevel: number;
    xpSinceLastLevel: number;
    xpUntilNextLevel: number;
};

export type LolSummonerRerollPoints = {
    currentPoints: number;
    maxRolls: number;
    numberOfRolls: number;
    pointsCostToRoll: number;
    pointsToReroll: number;
};
