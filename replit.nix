{pkgs}: {
  deps = [
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
