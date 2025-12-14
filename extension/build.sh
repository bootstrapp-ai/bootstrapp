#!/bin/bash
# Build script for Bootstrapp Extension
# Creates .zip (for Chrome Web Store) and .crx (for direct install)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
KEY_FILE="$SCRIPT_DIR/key.pem"

echo "Building Bootstrapp Extension..."
echo ""

# Create dist directory
mkdir -p "$DIST_DIR"

# Generate private key if it doesn't exist
if [ ! -f "$KEY_FILE" ]; then
    echo "Generating new private key..."
    openssl genrsa -out "$KEY_FILE" 2048
    echo "Private key saved to: $KEY_FILE"
    echo "⚠️  Keep this key safe! You need it to update the extension."
    echo ""
fi

# Create ZIP file
echo "Creating ZIP..."
cd "$SCRIPT_DIR"
zip -r "$DIST_DIR/bootstrapp-extension.zip" \
    manifest.json \
    background.js \
    content.js \
    index.js \
    admin-bridge.js \
    lib/ \
    sidepanel/ \
    popup/ \
    icons/*.png \
    -x "*.DS_Store" -x "__MACOSX/*"

echo "✓ ZIP created: $DIST_DIR/bootstrapp-extension.zip"

# Calculate Extension ID from public key
PUBLIC_KEY_DER=$(openssl rsa -in "$KEY_FILE" -pubout -outform DER 2>/dev/null | xxd -p | tr -d '\n')
EXTENSION_ID=$(echo -n "$PUBLIC_KEY_DER" | xxd -r -p | openssl dgst -sha256 -binary | head -c 16 | xxd -p | \
    sed 's/./\0\n/g' | while read -r c; do
        printf "\\x$(printf '%02x' $((0x$c / 16 + 97)))\\x$(printf '%02x' $((0x$c % 16 + 97)))"
    done | head -c 32)

echo ""
echo "✓ Extension ID: $EXTENSION_ID"
echo ""
echo "To install:"
echo "1. Open chrome://extensions"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select: $SCRIPT_DIR"
echo ""
echo "Or drag the ZIP to chrome://extensions"
