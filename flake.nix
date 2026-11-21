{
  description = "DraftGap development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      utils,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            pkg-config
            cargo
            bun
            pkg-config
            wrapGAppsHook4
            cargo
            rustc
          ];

          buildInputs = with pkgs; [
            glib
            glib-networking
            atk
            librsvg
            webkitgtk_4_1
            wayland
            libxkbcommon
          ];

          shellHook = ''
            export LD_LIBRARY_PATH=${
              pkgs.lib.makeLibraryPath (
                with pkgs;
                [
                  gtk3
                  libxkbcommon
                  wayland
                ]
              )
            }:$LD_LIBRARY_PATH
            # TLS backend for WebKitGTK (otherwise: "TLS support is not available")
            export GIO_MODULE_DIR=${pkgs.glib-networking}/lib/gio/modules/
            # Avoid WebKitGTK "Error 71 (Protocol error)" crash on Wayland
            export WEBKIT_DISABLE_DMABUF_RENDERER=1
          '';
        };
      }
    );
}
