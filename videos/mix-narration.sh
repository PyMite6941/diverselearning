#!/usr/bin/env bash
# Mix the narration over the music bed onto the silent cut.
set -e
FF="ffmpeg"          # or an absolute path to the binary
cd "$(dirname "$0")"

DUR=167
# scene start times, matching narrate.ps1 (scene 11 nudged 0.4s earlier to fit)
STARTS=(0.6 4.6 16.4 21.4 42.4 49.4 59.4 71.4 107.4 149.4 161.0)
NAMES=(01 02 03 04 05 06 07 08 09 10 11)

INPUTS=(-i silent.mp4 -i schumann_dreaming.ogg)
for n in "${NAMES[@]}"; do INPUTS+=(-i "vo/vo_${n}.wav"); done

FC=""
MIXIN=""
for i in "${!NAMES[@]}"; do
  idx=$((i + 2))                                  # inputs 0,1 are video + music
  ms=$(awk "BEGIN{printf \"%d\", ${STARTS[$i]} * 1000}")
  FC+="[${idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,adelay=${ms}|${ms}[n${i}];"
  MIXIN+="[n${i}]"
done

# Narration bus, then a quiet music bed under it, then loudness-normalise.
FC+="${MIXIN}amix=inputs=${#NAMES[@]}:normalize=0:dropout_transition=0[vo];"
FC+="[vo]apad=whole_dur=${DUR},volume=1.0[vopad];"
FC+="[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
FC+="atrim=0:${DUR},asetpts=N/SR/TB,afade=t=in:st=0:d=2.5,afade=t=out:st=$((DUR-5)):d=5,volume=0.20[bed];"
FC+="[vopad][bed]amix=inputs=2:normalize=0:dropout_transition=0[mixed];"
FC+="[mixed]loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.97[a]"

"$FF" -y -v error "${INPUTS[@]}" -filter_complex "$FC" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t $DUR \
  demo-includai-3min-narrated.mp4

ffprobe -v error -show_entries format=duration -of csv=p=0 demo-includai-3min-narrated.mp4
ls -la demo-includai-3min-narrated.mp4
