#!/bin/sh
# Genera index.html a partir de src/ (orden importa)
set -e
cd "$(dirname "$0")/src"
{
cat a2_head.html
cat b2_data.js c2_logic.js c2b_classes.js d3a_sprites.js d3b_world.js d3c_chars.js d3c2_creat.js d3d_update.js d3e_draw.js d4a_ui.js d4b_input.js d5_backend.js d6_screens.js d7_multiplayer.js d8_boot.js
} > ../index.html
echo "index.html: $(wc -c < ../index.html) bytes"
