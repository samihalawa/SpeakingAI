{pkgs}: {
  deps = [
    pkgs.openssh
    pkgs.tree
    pkgs.wget
    pkgs.jq
    pkgs.cups
    pkgs.atk
    pkgs.glib
    pkgs.cairo
    pkgs.pango
    pkgs.dbus
    pkgs.gtk3
    pkgs.chromium
    pkgs.nodejs
    pkgs.nodePackages.typescript-language-server
    pkgs.postgresql
  ];
}
