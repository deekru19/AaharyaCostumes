#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT_DIR="$ROOT_DIR/catalog_assets"
OUTPUT_DIR="$ROOT_DIR/mobile-catalog/public/assets/generated"
TMP_DIR="$ROOT_DIR/.tmp_catalog_generation"
MANIFEST="$ROOT_DIR/mobile-catalog/src/generated_manifest.json"

mkdir -p "$OUTPUT_DIR" "$TMP_DIR"
rm -f "$OUTPUT_DIR"/*.jpg

# filename|crop(x,y,w,h)|method|key_color|fuzz|fit
readarray -t CONFIG <<'LINES'
Aharya Costumes 2025 (1)_page-0006.jpg|1720,110,620,1230|key|#e8c6a8|18|900x1550
Aharya Costumes 2025 (1)_page-0007.jpg|890,230,930,1030|black|black|24|930x1500
Aharya Costumes 2025 (1)_page-0008.jpg|70,120,860,1180|key|#efefef|16|900x1550
Aharya Costumes 2025 (1)_page-0009.jpg|1730,590,620,740|black|black|20|920x1450
Aharya Costumes 2025 (1)_page-0010.jpg|930,280,620,990|key|#8d8a8a|18|930x1500
Aharya Costumes 2025 (1)_page-0012.jpg|130,210,700,1070|key|#e9bec7|16|920x1500
Aharya Costumes 2025 (1)_page-0015.jpg|1710,140,600,1170|key|#ececec|16|900x1550
Aharya Costumes 2025 (1)_page-0017.jpg|1700,150,610,1170|key|#e8c7aa|18|900x1550
Aharya Costumes 2025 (1)_page-0019.jpg|1630,240,630,1020|key|#ececec|16|900x1500
Aharya Costumes 2025 (1)_page-0020.jpg|920,220,620,1080|key|#efefef|15|920x1520
Aharya Costumes 2025 (1)_page-0021.jpg|120,170,940,1100|key|#f5f5f1|18|940x1500
Aharya Costumes 2025 (1)_page-0022.jpg|140,170,900,1100|key|#f4f4f2|18|920x1500
Aharya Costumes 2025 (1)_page-0024.jpg|1220,120,980,1140|flood|none|10|940x1520
Aharya Costumes 2025 (1)_page-0026.jpg|120,250,760,980|black|black|22|920x1500
Aharya Costumes 2025 (1)_page-0028.jpg|1690,210,620,1030|black|black|20|920x1500
Aharya Costumes 2025 (1)_page-0029.jpg|1660,70,700,1250|black|black|22|930x1560
Aharya Costumes 2025 (1)_page-0030.jpg|850,460,780,860|flood|none|12|950x1480
Aharya Costumes 2025 (1)_page-0036.jpg|860,60,760,1240|key|#d8c7a9|15|920x1560
page_2.jpg|820,150,760,1190|key|#efefef|15|920x1550
page_3.jpg|890,130,640,1180|key|#e7c6a8|17|900x1550
page_4.jpg|510,130,700,1030|flood|none|12|930x1500
LINES

printf '[\n' > "$MANIFEST"
index=1
for line in "${CONFIG[@]}"; do
  IFS='|' read -r filename crop method key_color fuzz fit <<< "$line"
  IFS=',' read -r x y w h <<< "$crop"

  input="$INPUT_DIR/$filename"
  out_name=$(printf 'look_%02d.jpg' "$index")
  out_file="$OUTPUT_DIR/$out_name"
  crop_png="$TMP_DIR/crop_${index}.png"
  subject_png="$TMP_DIR/subj_${index}.png"

  if [[ ! -f "$input" ]]; then
    echo "Missing input: $input" >&2
    exit 1
  fi

  magick "$input" -crop "${w}x${h}+${x}+${y}" +repage "$crop_png"

  case "$method" in
    key)
      magick "$crop_png" \
        -alpha set \
        -fuzz "${fuzz}%" \
        -transparent "$key_color" \
        -trim +repage \
        "$subject_png"
      ;;
    black)
      magick "$crop_png" \
        -alpha set \
        -fuzz "${fuzz}%" \
        -transparent black \
        -trim +repage \
        "$subject_png"
      ;;
    flood)
      read -r cw ch <<< "$(identify -format '%w %h' "$crop_png")"
      max_x=$((cw - 1))
      max_y=$((ch - 1))
      magick "$crop_png" \
        -alpha set \
        -fuzz "${fuzz}%" \
        -fill none \
        -draw "color 0,0 floodfill" \
        -draw "color ${max_x},0 floodfill" \
        -draw "color 0,${max_y} floodfill" \
        -draw "color ${max_x},${max_y} floodfill" \
        -trim +repage \
        "$subject_png"
      ;;
    *)
      cp "$crop_png" "$subject_png"
      ;;
  esac

  magick -size 1024x1792 gradient:'#f4f4f4-#e6e6e6' \
    \( "$subject_png" -resize "$fit" -unsharp 0x0.8 \) \
    -gravity south -geometry +0+24 -compose over -composite \
    -quality 92 "$out_file"

  comma=','
  if [[ $index -eq ${#CONFIG[@]} ]]; then
    comma=''
  fi
  printf '  {"id": %d, "input": "%s", "output": "%s"}%s\n' "$index" "$filename" "catalog_assets/generated/$out_name" "$comma" >> "$MANIFEST"

  index=$((index + 1))
done
printf ']\n' >> "$MANIFEST"

echo "Generated $((index - 1)) images in $OUTPUT_DIR"
