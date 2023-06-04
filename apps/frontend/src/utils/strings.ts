export const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

export const overflowEllipsis = (str: string, length: number) =>
    str.length > length + 1 ? str.slice(0, length) + "..." : str;
