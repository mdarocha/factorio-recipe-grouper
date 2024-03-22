{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { nixpkgs, ... }: let
    pkgs = import nixpkgs { system = "x86_64-linux"; };
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      buildInputs = with pkgs; [ deno ];
    };

    apps.x86_64-linux.get-assets = {
        type = "app";
        program = builtins.toString (pkgs.writeShellScript "get-assets.sh" ''
            echo "Downloading data.json and icons.webp..."
            curl https://factoriolab.github.io/data/1.1/data.json > src/data.json
            curl https://factoriolab.github.io/data/1.1/icons.webp > src/icons.webp
        '');
    };
  };
}
