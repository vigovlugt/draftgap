export function bytesToHumanReadable(size: number) {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));

    return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${
        ["B", "kB", "MB", "GB", "TB"][i]
    }`;
}
