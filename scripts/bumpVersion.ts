import { readFileSync, writeFileSync } from "fs";

function getNextVersion(currentVersion: string, versionType: string): string {
    const versionParts = currentVersion.split(".");
    const major = parseInt(versionParts[0], 10);
    const minor = parseInt(versionParts[1], 10);
    const patch = parseInt(versionParts[2], 10);

    switch (versionType) {
        case "PATCH":
            return `${major}.${minor}.${patch + 1}`;
        case "MINOR":
            return `${major}.${minor + 1}.0`;
        case "MAJOR":
            return `${major + 1}.0.0`;
        default:
            throw new Error(`Invalid version type: ${versionType}`);
    }
}

export function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("Usage: pnpm bump:version PATCH|MINOR|MAJOR");
        return;
    }
    const versionType = args[0].toUpperCase();

    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const tauriConfJson = JSON.parse(
        readFileSync("src-tauri/tauri.conf.json", "utf8")
    );

    const currentVersion = packageJson.version;
    const nextVersion = getNextVersion(currentVersion, versionType);

    // Update package.json
    packageJson.version = nextVersion;
    writeFileSync("package.json", JSON.stringify(packageJson, null, 4));

    // Update tauri.conf.json
    tauriConfJson.package.version = nextVersion;
    writeFileSync(
        "src-tauri/tauri.conf.json",
        JSON.stringify(tauriConfJson, null, 4)
    );

    console.log(`Bumped version from ${currentVersion} to ${nextVersion}`);

    console.log(
        `To release new version, run\ngit commit -am "Release ${nextVersion}" && git tag v${nextVersion} && git push && git push --tags`
    );
}

main();
