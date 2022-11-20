import { LolalyticsRole } from "../data/lolalytics";

export const Role = {
    Top: 0,
    Jungle: 1,
    Middle: 2,
    Bottom: 3,
    Support: 4,
} as const;

export type Role = typeof ROLES[number];

export const ROLES = [0, 1, 2, 3, 4] as const;

export function getRoleFromString(role: LolalyticsRole): Role {
    switch (role) {
        case "top":
            return Role.Top;
        case "jungle":
            return Role.Jungle;
        case "middle":
            return Role.Middle;
        case "bottom":
            return Role.Bottom;
        case "support":
            return Role.Support;
    }
}
