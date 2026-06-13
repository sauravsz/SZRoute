#!/bin/bash
set -e

echo "==> Building SZRoute in Release mode..."
swift build -c release

APP_NAME="SZRoute"
APP_BUNDLE="$APP_NAME.app"
BIN_PATH=".build/release/SZRouteNative"

echo "==> Creating .app bundle structure..."
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

echo "==> Copying binary..."
cp "$BIN_PATH" "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

echo "==> Generating Info.plist..."
cat > "$APP_BUNDLE/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.szroute.native</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "==> Creating DMG..."
DMG_NAME="${APP_NAME}.dmg"
rm -f "$DMG_NAME"
# Create a temporary folder for DMG contents
mkdir -p dmg_tmp
cp -r "$APP_BUNDLE" dmg_tmp/
ln -s /Applications dmg_tmp/Applications

hdiutil create -volname "$APP_NAME" -srcfolder dmg_tmp -ov -format UDZO "$DMG_NAME"

rm -rf dmg_tmp

echo "==> Moving DMG to Downloads..."
mv "$DMG_NAME" ~/Downloads/

echo "==> Done! $DMG_NAME is now in your Downloads folder."
