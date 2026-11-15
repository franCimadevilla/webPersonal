#!/usr/bin/env bash
# Descarga WebGazer.js (https://webgazer.cs.brown.edu/, GPLv3) desde npm y
# deja en tests/eyetracking/vendor/webgazer/ el script y los modelos de
# MediaPipe FaceMesh que necesita. La carpeta vendor/ no se versiona (19 MB).
#
#   bash tests/eyetracking/instalar-webgazer.sh
set -euo pipefail

VERSION="3.5.3"
DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$DIR/vendor/webgazer"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Descargando webgazer@$VERSION…"
(cd "$TMP" && npm pack "webgazer@$VERSION" --silent >/dev/null && tar -xzf "webgazer-$VERSION.tgz")

rm -rf "$DEST"
mkdir -p "$DEST"
cp "$TMP/package/dist/webgazer.js" "$DEST/"
cp -r "$TMP/package/dist/mediapipe" "$DEST/"
cp "$TMP/package/LICENSE.md" "$DEST/"
echo "$VERSION" > "$DEST/VERSION"

echo "Listo: $DEST"
echo "Arranca el servidor (python -m http.server 3000) y abre http://localhost:3000/tests/eyetracking/"
