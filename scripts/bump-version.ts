import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { exec } from "child_process";

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

function getPaths(dir: string, fileName: string): string[] {
    return readdirSync(dir)
        .map((f) => [f, statSync(f)] as const)
        .reduce((paths, [f, stat]) => {
            const path = join(dir, f);
            if (stat.isDirectory()) {
                return paths.concat(getPaths(path, fileName));
            } else if (stat.isFile() && f === fileName) {
                return paths.concat(path);
            }

            return paths;
        }, [] as string[]);
}

export function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("Usage: pnpm bump:version PATCH|MINOR|MAJOR");
        return;
    }
    const versionType = args[0].toUpperCase();

    const mainPackage = JSON.parse(readFileSync("package.json", "utf8"));
    const currentVersion = mainPackage.version;
    const nextVersion = getNextVersion(currentVersion, versionType);

    // Update package.json
    const files = [
        "package.json",
        ...getPaths("./apps", "package.json"),
        ...getPaths("./packages", "package.json"),
    ];
    for (const file of files) {
        const packageJson = JSON.parse(readFileSync(file, "utf8"));
        packageJson.version = nextVersion;
        writeFileSync(file, JSON.stringify(packageJson, null, 4));
    }

    // Update tauri.conf.json
    const tauriConfJson = JSON.parse(
        readFileSync("src-tauri/tauri.conf.json", "utf8")
    );
    tauriConfJson.package.version = nextVersion;
    writeFileSync(
        "src-tauri/tauri.conf.json",
        JSON.stringify(tauriConfJson, null, 4)
    );

    console.log(`Bumped version from ${currentVersion} to ${nextVersion}`);

    console.log("Releasing new version...");

    const cmd = `git commit -am "Release ${nextVersion}" && git tag v${nextVersion} && git push && git push --tags`;
    console.log(cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(stdout);
        console.error(stderr);
    });
}

main();
