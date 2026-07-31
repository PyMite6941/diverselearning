#!/usr/bin/env bash
# Build a <=3:00 IncludAI demo cut from the 6:40 raw screen recording.
set -e

FF="ffmpeg"          # or an absolute path to the binary
SRC="videos/demo.mp4"   # run from the repo root
SP="videos"
cd "$SP"

calc() { awk "BEGIN{printf \"%.2f\", $1}"; }

W=1440; H=900; FPS=25
FONT="segoeui.ttf"
FONTB="segoeuib.ttf"

# Caption style: bottom lower-third, dark box, generous size.
cap() {  # $1 = text
  echo "drawtext=fontfile=${FONT}:text='$1':fontsize=34:fontcolor=white:x=(w-text_w)/2:y=h-96:box=1:boxcolor=black@0.72:boxborderw=22"
}

# The app header renders "Signed in as <personal email>". This video goes on
# YouTube, so that region is blurred out on every segment where the dashboard
# header is on screen. Region measured on the 1440x900 frame.
BLURBOX="crop=264:28:20:47,boxblur=luma_radius=14:luma_power=3:chroma_radius=6:chroma_power=3"

seg() {  # $1=name $2=start $3=dur $4=caption $5="blur" to hide the email header
  local pre="scale=${W}:${H},fps=${FPS},setsar=1"
  local post=""
  if [ -n "$4" ]; then post="$(cap "$4"),"; fi
  post="${post}fade=t=in:st=0:d=0.35,fade=t=out:st=$(calc "$3 - 0.35"):d=0.35"

  local fc
  if [ "$5" = "blur" ]; then
    fc="[0:v]${pre}[b0];[b0]split[b][t];[t]${BLURBOX}[bl];[b][bl]overlay=20:47[ov];[ov]${post}[v]"
  else
    fc="[0:v]${pre},${post}[v]"
  fi

  "$FF" -y -v error -ss "$2" -t "$3" -i "$SRC" \
    -filter_complex "$fc" -map "[v]" -an -c:v libx264 -preset medium -crf 20 \
    -pix_fmt yuv420p -r $FPS "seg_$1.mp4"
  echo "  seg_$1.mp4  ${3}s${5:+  [email blurred]}"
}

card() {  # $1=name $2=dur $3=line1 $4=line2 $5=line3
  local vf="drawtext=fontfile=${FONTB}:text='$3':fontsize=76:fontcolor=white:x=(w-text_w)/2:y=h/2-130"
  vf="${vf},drawtext=fontfile=${FONT}:text='$4':fontsize=36:fontcolor=0xb9c6d4:x=(w-text_w)/2:y=h/2-20"
  [ -n "$5" ] && vf="${vf},drawtext=fontfile=${FONT}:text='$5':fontsize=28:fontcolor=0x8a97a6:x=(w-text_w)/2:y=h/2+60"
  vf="${vf},fade=t=in:st=0:d=0.5,fade=t=out:st=$(calc "$2 - 0.6"):d=0.6"
  "$FF" -y -v error -f lavfi -i "color=c=0x0b1020:s=${W}x${H}:d=$2:r=${FPS}" \
    -vf "$vf" -an -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "seg_$1.mp4"
  echo "  seg_$1.mp4  ${2}s (card)"
}

echo "Building segments..."
card 00_title 4 "DiverseLearning" "AI-generated 3D courses for learners who think differently" "IncludAI 2026 - AI for Learners Who Think Differently"
seg  01_empty   12  12 "Start with an empty board and any topic you are curious about" blur
seg  02_ask     28   5 "Ask for anything" blur
seg  03_gen     49  21 "The AI writes the course AND a 3D model for every lesson" blur
seg  04_made    70   7 "Your course, built in seconds" blur
seg  05_open   206  10 "The lesson IS the model - text is the support, not the wall"
seg  06_earth  256  12 "Each lesson gets its own model"
seg  07_break  268  36 "Break apart - every piece labeled, click one to understand just that piece"
seg  08_a11y   304  42 "Recolor everything, switch to a dyslexia-friendly font, open up the spacing"
seg  09_board  380  12 "Courses save to your account" blur
card 10_end 6 "Try it" "diverselearning.vercel.app" "github.com/PyMite6941/diverselearning"

echo "Concatenating..."
: > list.txt
for f in seg_00_title seg_01_empty seg_02_ask seg_03_gen seg_04_made seg_05_open \
         seg_06_earth seg_07_break seg_08_a11y seg_09_board seg_10_end; do
  echo "file '$f.mp4'" >> list.txt
done
"$FF" -y -v error -f concat -safe 0 -i list.txt -c copy silent.mp4

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 silent.mp4)
echo "Silent cut: ${DUR}s"

echo "Scoring with Schumann - Kinderszenen Op.15 No.7 (public domain, Musopen)..."
"$FF" -y -v error -i silent.mp4 -i schumann_dreaming.ogg \
  -filter_complex "[1:a]atrim=0:${DUR},asetpts=N/SR/TB,afade=t=in:st=0:d=2.5,afade=t=out:st=$(calc "$DUR - 5"):d=5,volume=0.55[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest \
  "demo-includai-3min.mp4"

echo
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height -of default=noprint_wrappers=1 "demo-includai-3min.mp4"
ls -la "demo-includai-3min.mp4"
