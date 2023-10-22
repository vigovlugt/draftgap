export type RuneData = {
    id: number;
    key: string;
    name: string;
    icon: string;

    pathId: number;
    // 0: keystone, 1,2,3: minor runes in row 1,2 or 3
    slot: number;
    index: number;
};

export type RunePathData = {
    id: number;
    key: string;
    name: string;
    icon: string;
};

export type StatShardData = {
    id: number;
    key: string;
    name: string;

    positions: {
        // 0: offense, 1: flex, 2: defense
        slot: number;
        index: number;
    }[];
};
