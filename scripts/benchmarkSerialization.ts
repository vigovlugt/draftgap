import { write, writeFileSync } from "fs";
import {
    ChampionMatchupData,
    serializeChampionMatchupData,
} from "../src/lib/models/ChampionMatchupData";
import { ChampionRoleData } from "../src/lib/models/ChampionRoleData";
import {
    Dataset,
    deserializeDataset,
    serializeDataset,
} from "../src/lib/models/Dataset";
import {
    serialize,
    serializeString,
} from "../src/lib/serialization/serialization";

const data = {
    "1": {
        id: "Annie",
        key: "1",
        name: "Annie",
        statsByRole: {
            2: {
                games: 44493,
                wins: 23047,
                matchup: {
                    0: {
                        "2": { championKey: "2", games: 564, wins: 267 },
                        "3": { championKey: "3", games: 17, wins: 13 },
                        "4": { championKey: "4", games: 5, wins: 3 },
                        "5": { championKey: "5", games: 36, wins: 20 },
                        "6": { championKey: "6", games: 581, wins: 290 },
                        "7": { championKey: "7", games: 8, wins: 4 },
                        "8": { championKey: "8", games: 271, wins: 145 },
                        "9": { championKey: "9", games: 10, wins: 7 },
                        "10": { championKey: "10", games: 500, wins: 262 },
                        "11": { championKey: "11", games: 40, wins: 22 },
                        "12": { championKey: "12", games: 10, wins: 4 },
                        "13": { championKey: "13", games: 134, wins: 70 },
                        "14": { championKey: "14", games: 1016, wins: 538 },
                        "15": { championKey: "15", games: 2, wins: 2 },
                        "16": { championKey: "16", games: 13, wins: 7 },
                        "17": { championKey: "17", games: 617, wins: 343 },
                        "18": { championKey: "18", games: 36, wins: 16 },
                        "19": { championKey: "19", games: 353, wins: 164 },
                        "20": { championKey: "20", games: 2, wins: 2 },
                        "21": { championKey: "21", games: 2, wins: 1 },
                        "22": { championKey: "22", games: 17, wins: 9 },
                        "23": { championKey: "23", games: 576, wins: 294 },
                        "24": { championKey: "24", games: 1479, wins: 762 },
                        "25": { championKey: "25", games: 5, wins: 4 },
                        "26": { championKey: "26", games: 14, wins: 7 },
                        "27": { championKey: "27", games: 432, wins: 221 },
                        "28": { championKey: "28", games: 6, wins: 5 },
                        "29": { championKey: "29", games: 25, wins: 11 },
                        "30": { championKey: "30", games: 26, wins: 10 },
                        "31": { championKey: "31", games: 386, wins: 195 },
                        "32": { championKey: "32", games: 9, wins: 5 },
                        "33": { championKey: "33", games: 50, wins: 28 },
                        "34": { championKey: "34", games: 19, wins: 10 },
                        "35": { championKey: "35", games: 32, wins: 12 },
                        "36": { championKey: "36", games: 455, wins: 228 },
                        "38": { championKey: "38", games: 13, wins: 8 },
                        "39": { championKey: "39", games: 1079, wins: 570 },
                        "40": { championKey: "40", games: 10, wins: 4 },
                        "41": { championKey: "41", games: 1296, wins: 655 },
                        "42": { championKey: "42", games: 10, wins: 7 },
                        "43": { championKey: "43", games: 80, wins: 42 },
                        "44": { championKey: "44", games: 10, wins: 6 },
                        "45": { championKey: "45", games: 22, wins: 12 },
                        "48": { championKey: "48", games: 193, wins: 101 },
                        "50": { championKey: "50", games: 102, wins: 51 },
                        "51": { championKey: "51", games: 13, wins: 8 },
                        "53": { championKey: "53", games: 8, wins: 4 },
                        "54": { championKey: "54", games: 655, wins: 310 },
                        "55": { championKey: "55", games: 49, wins: 27 },
                        "56": { championKey: "56", games: 14, wins: 6 },
                        "57": { championKey: "57", games: 390, wins: 201 },
                        "58": { championKey: "58", games: 1074, wins: 587 },
                        "59": { championKey: "59", games: 18, wins: 13 },
                        "60": { championKey: "60", games: 3, wins: 1 },
                        "61": { championKey: "61", games: 2, wins: 1 },
                        "62": { championKey: "62", games: 272, wins: 137 },
                        "63": { championKey: "63", games: 21, wins: 11 },
                        "64": { championKey: "64", games: 20, wins: 9 },
                        "67": { championKey: "67", games: 379, wins: 206 },
                        "68": { championKey: "68", games: 276, wins: 151 },
                        "69": { championKey: "69", games: 83, wins: 41 },
                        "72": { championKey: "72", games: 37, wins: 22 },
                        "74": { championKey: "74", games: 140, wins: 67 },
                        "75": { championKey: "75", games: 1226, wins: 589 },
                        "76": { championKey: "76", games: 13, wins: 8 },
                        "77": { championKey: "77", games: 199, wins: 121 },
                        "78": { championKey: "78", games: 241, wins: 116 },
                        "79": { championKey: "79", games: 548, wins: 294 },
                        "80": { championKey: "80", games: 298, wins: 159 },
                        "81": { championKey: "81", games: 10, wins: 6 },
                        "82": { championKey: "82", games: 1563, wins: 838 },
                        "83": { championKey: "83", games: 603, wins: 328 },
                        "84": { championKey: "84", games: 582, wins: 342 },
                        "85": { championKey: "85", games: 285, wins: 156 },
                        "86": { championKey: "86", games: 1279, wins: 651 },
                        "90": { championKey: "90", games: 49, wins: 24 },
                        "91": { championKey: "91", games: 24, wins: 10 },
                        "92": { championKey: "92", games: 990, wins: 513 },
                        "96": { championKey: "96", games: 4, wins: 2 },
                        "98": { championKey: "98", games: 1265, wins: 619 },
                        "99": { championKey: "99", games: 5, wins: 3 },
                        "101": { championKey: "101", games: 2, wins: 2 },
                        "102": { championKey: "102", games: 74, wins: 39 },
                        "103": { championKey: "103", games: 6, wins: 3 },
                        "104": { championKey: "104", games: 108, wins: 62 },
                        "105": { championKey: "105", games: 13, wins: 8 },
                        "106": { championKey: "106", games: 482, wins: 263 },
                        "107": { championKey: "107", games: 223, wins: 118 },
                        "110": { championKey: "110", games: 27, wins: 12 },
                        "111": { championKey: "111", games: 11, wins: 6 },
                        "112": { championKey: "112", games: 50, wins: 28 },
                        "113": { championKey: "113", games: 651, wins: 311 },
                        "114": { championKey: "114", games: 1935, wins: 961 },
                        "115": { championKey: "115", games: 3, wins: 3 },
                        "117": { championKey: "117", games: 8, wins: 1 },
                        "119": { championKey: "119", games: 33, wins: 13 },
                        "120": { championKey: "120", games: 6, wins: 3 },
                        "121": { championKey: "121", games: 6, wins: 3 },
                        "122": { championKey: "122", games: 2216, wins: 1098 },
                        "126": { championKey: "126", games: 644, wins: 343 },
                        "127": { championKey: "127", games: 19, wins: 8 },
                        "131": { championKey: "131", games: 6, wins: 2 },
                        "133": { championKey: "133", games: 316, wins: 165 },
                        "134": { championKey: "134", games: 13, wins: 7 },
                        "136": { championKey: "136", games: 8, wins: 4 },
                        "141": { championKey: "141", games: 36, wins: 18 },
                        "142": { championKey: "142", games: 2, wins: 1 },
                        "143": { championKey: "143", games: 2, wins: 1 },
                        "145": { championKey: "145", games: 65, wins: 34 },
                        "147": { championKey: "147", games: 2, wins: 2 },
                        "150": { championKey: "150", games: 627, wins: 350 },
                        "154": { championKey: "154", games: 149, wins: 73 },
                        "157": { championKey: "157", games: 485, wins: 253 },
                        "161": { championKey: "161", games: 9, wins: 7 },
                        "164": { championKey: "164", games: 1528, wins: 789 },
                        "166": { championKey: "166", games: 246, wins: 117 },
                        "200": { championKey: "200", games: 17, wins: 8 },
                        "201": { championKey: "201", games: 2, wins: 2 },
                        "202": { championKey: "202", games: 18, wins: 8 },
                        "203": { championKey: "203", games: 5, wins: 3 },
                        "221": { championKey: "221", games: 2, wins: 1 },
                        "223": { championKey: "223", games: 270, wins: 144 },
                        "234": { championKey: "234", games: 52, wins: 25 },
                        "235": { championKey: "235", games: 8, wins: 5 },
                        "236": { championKey: "236", games: 50, wins: 30 },
                        "238": { championKey: "238", games: 52, wins: 29 },
                        "240": { championKey: "240", games: 422, wins: 198 },
                        "245": { championKey: "245", games: 30, wins: 19 },
                        "246": { championKey: "246", games: 15, wins: 9 },
                        "254": { championKey: "254", games: 9, wins: 5 },
                        "266": { championKey: "266", games: 2724, wins: 1426 },
                        "268": { championKey: "268", games: 34, wins: 26 },
                        "350": { championKey: "350", games: 1, wins: 1 },
                        "360": { championKey: "360", games: 11, wins: 7 },
                        "412": { championKey: "412", games: 4, wins: 2 },
                        "420": { championKey: "420", games: 660, wins: 345 },
                        "421": { championKey: "421", games: 10, wins: 4 },
                        "427": { championKey: "427", games: 9, wins: 4 },
                        "429": { championKey: "429", games: 32, wins: 15 },
                        "432": { championKey: "432", games: 8, wins: 4 },
                        "497": { championKey: "497", games: 1, wins: 0 },
                        "516": { championKey: "516", games: 1327, wins: 694 },
                        "517": { championKey: "517", games: 248, wins: 119 },
                        "518": { championKey: "518", games: 53, wins: 27 },
                        "523": { championKey: "523", games: 4, wins: 2 },
                        "526": { championKey: "526", games: 3, wins: 2 },
                        "555": { championKey: "555", games: 6, wins: 2 },
                        "711": { championKey: "711", games: 10, wins: 4 },
                        "777": { championKey: "777", games: 1309, wins: 685 },
                        "875": { championKey: "875", games: 1679, wins: 861 },
                        "876": { championKey: "876", games: 140, wins: 68 },
                        "887": { championKey: "887", games: 541, wins: 271 },
                        "888": { championKey: "888", games: 1, wins: 0 },
                        "895": { championKey: "895", games: 12, wins: 6 },
                        "897": { championKey: "897", games: 1502, wins: 859 },
                    },
                    1: {
                        "2": { championKey: "2", games: 186, wins: 94 },
                        "3": { championKey: "3", games: 1, wins: 0 },
                        "4": { championKey: "4", games: 2, wins: 2 },
                        "5": { championKey: "5", games: 438, wins: 207 },
                        "6": { championKey: "6", games: 4, wins: 0 },
                        "9": { championKey: "9", games: 1064, wins: 524 },
                        "10": { championKey: "10", games: 1, wins: 1 },
                        "11": { championKey: "11", games: 1596, wins: 861 },
                        "12": { championKey: "12", games: 2, wins: 0 },
                        "13": { championKey: "13", games: 4, wins: 3 },
                        "14": { championKey: "14", games: 43, wins: 19 },
                        "17": { championKey: "17", games: 38, wins: 22 },
                        "18": { championKey: "18", games: 4, wins: 2 },
                        "19": { championKey: "19", games: 668, wins: 360 },
                        "20": { championKey: "20", games: 588, wins: 282 },
                        "22": { championKey: "22", games: 1, wins: 1 },
                        "23": { championKey: "23", games: 17, wins: 12 },
                        "24": { championKey: "24", games: 132, wins: 68 },
                        "25": { championKey: "25", games: 31, wins: 22 },
                        "27": { championKey: "27", games: 23, wins: 15 },
                        "28": { championKey: "28", games: 1032, wins: 544 },
                        "29": { championKey: "29", games: 148, wins: 92 },
                        "30": { championKey: "30", games: 488, wins: 271 },
                        "31": { championKey: "31", games: 22, wins: 13 },
                        "32": { championKey: "32", games: 574, wins: 274 },
                        "33": { championKey: "33", games: 839, wins: 436 },
                        "34": { championKey: "34", games: 1, wins: 0 },
                        "35": { championKey: "35", games: 1191, wins: 640 },
                        "36": { championKey: "36", games: 77, wins: 41 },
                        "39": { championKey: "39", games: 1, wins: 0 },
                        "42": { championKey: "42", games: 1, wins: 0 },
                        "43": { championKey: "43", games: 1, wins: 0 },
                        "44": { championKey: "44", games: 32, wins: 14 },
                        "45": { championKey: "45", games: 1, wins: 1 },
                        "48": { championKey: "48", games: 496, wins: 255 },
                        "50": { championKey: "50", games: 2, wins: 2 },
                        "53": { championKey: "53", games: 260, wins: 139 },
                        "54": { championKey: "54", games: 9, wins: 8 },
                        "55": { championKey: "55", games: 8, wins: 6 },
                        "56": { championKey: "56", games: 770, wins: 373 },
                        "57": { championKey: "57", games: 415, wins: 194 },
                        "59": { championKey: "59", games: 766, wins: 372 },
                        "60": { championKey: "60", games: 873, wins: 457 },
                        "62": { championKey: "62", games: 488, wins: 262 },
                        "63": { championKey: "63", games: 4, wins: 1 },
                        "64": { championKey: "64", games: 2098, wins: 1158 },
                        "67": { championKey: "67", games: 5, wins: 4 },
                        "68": { championKey: "68", games: 49, wins: 25 },
                        "72": { championKey: "72", games: 170, wins: 87 },
                        "75": { championKey: "75", games: 47, wins: 24 },
                        "76": { championKey: "76", games: 698, wins: 363 },
                    },
                    2: {},
                    4: {},
                    3: {},
                },
                synergy: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                },
                damageProfile: {
                    true: 0,
                    physical: 0,
                    magic: 0,
                },
            },
        },
    },
} as unknown as Dataset;

async function main() {
    const jsonData = JSON.stringify(data, null, 2);
    const jsonBuffer = Buffer.from(jsonData);
    const jsonLength = jsonBuffer.byteLength;

    const binary = serializeDataset(data);

    const binaryData = Buffer.from(binary);
    const binaryLength = binaryData.byteLength;

    const deserialized = deserializeDataset(binary);
    const deserializedData = JSON.stringify(deserialized, null, 2);

    console.log(`JSON length: ${jsonLength}`);
    console.log(`Binary length: ${binaryLength}`);
    console.log(`Deserialized length: ${deserializedData.length}`);
    console.log(
        `Binary is ${Math.round((binaryLength / jsonLength) * 100)}% of JSON`
    );
}

async function main2() {
    const value = {
        championKey: "2",
        games: 564,
        wins: 267,
    } as ChampionMatchupData;

    const jsonData = JSON.stringify(value);
    const jsonBuffer = Buffer.from(jsonData);
    const jsonLength = jsonBuffer.byteLength;

    const binary = serialize(serializeChampionMatchupData, value);
    const binaryData = Buffer.from(binary);
    const binaryLength = binaryData.byteLength;

    console.log(`JSON length: ${jsonLength}`);
    console.log(`Binary length: ${binaryLength}`);
    console.log(
        `Binary is ${Math.round((binaryLength / jsonLength) * 100)}% of JSON`
    );
}

main();
