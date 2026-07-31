# Generate the narration track for the IncludAI demo cut.
# One WAV per scene; each is placed at its scene's start time by the ffmpeg mix.
param(
  [string]$Voice = "Microsoft David Desktop",
  [int]$Rate = 0,
  [string]$OutDir = "C:\Users\gresh\AppData\Local\Temp\claude\C--Users-gresh-OneDrive-------\39d4f5ee-b621-4d2f-aa01-b45bf76efcbc\scratchpad\vid\vo"
)

Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# name, scene start (s), scene length (s), line
$lines = @(
  @{ n="01"; start=0.6;   len=3.4;  t="When I learn something, I take it apart." }
  @{ n="02"; start=4.6;   len=11.4; t="Most tools hand you a wall of paragraphs, and expect the taking apart to happen in your head. DiverseLearning starts somewhere else. An empty board." }
  @{ n="03"; start=16.4;  len=4.6;  t="Type any topic you're curious about, and how you learn best." }
  @{ n="04"; start=21.4;  len=20.6; t="Then the AI does something unusual. It doesn't just write text. It writes a 3D model for every single lesson. Every part positioned, scaled, and labeled. The models are data, not code, so it can build a diagram for a topic nobody ever hand authored." }
  @{ n="05"; start=42.4;  len=6.6;  t="A few seconds later the course exists. Four lessons, each with its own model." }
  @{ n="06"; start=49.4;  len=9.6;  t="Open it, and the lesson is the model. You turn it, you look at it. The text supports it. It isn't the wall." }
  @{ n="07"; start=59.4;  len=11.6; t="Every lesson gets its own. This one is Earth, with its atmosphere and its orbit. Reading about a thing is one experience. Holding it is another." }
  @{ n="08"; start=71.4;  len=35.6; t="Here is the part I built for myself. Break apart. The model explodes into its pieces, every one of them labeled, and you click the piece you don't understand to get an explanation of just that piece. That is my actual process. When I learn something, I break it into parts and put it back together, and where a part won't break down any further, that is where I go and research. This is that, as software." }
  @{ n="09"; start=107.4; len=41.6; t="And then there is how it reads. Every colour in the interface is yours to change. Not a dark mode. Every channel, so you can build the contrast your eyes actually want. One tap for OpenDyslexic. One tap for roomier text. There is a line reader that highlights the line you are on, numbers down the side so you never lose your place, and text to speech on every lesson. None of this is buried in a settings page. It is one button, always in reach, because a reading support you cannot find is not a support." }
  @{ n="10"; start=149.4; len=11.6; t="Everything saves to your account and follows you to any device. The concept library is open to everyone. No sign in, no key, no cost." }
  @{ n="11"; start=161.4; len=5.4;  t="It is live, and open source. Built by someone who learns this way." }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $synth.SelectVoice($Voice) } catch { Write-Host "Voice '$Voice' unavailable, using default." }
$synth.Rate = $Rate

$report = @()
foreach ($l in $lines) {
  $path = Join-Path $OutDir ("vo_" + $l.n + ".wav")
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($l.t)
  $synth.SetOutputToNull()

  $r = New-Object System.Media.SoundPlayer $path
  $dur = [double](& ffprobe -v error -show_entries format=duration -of csv=p=0 $path)
  $fit = if ($dur -le $l.len) { "OK" } else { "OVER by " + [math]::Round($dur - $l.len,1) + "s" }
  $report += [pscustomobject]@{ Scene=$l.n; Start=$l.start; Budget=$l.len; Spoken=[math]::Round($dur,1); Fit=$fit }
}
$synth.Dispose()
$report | Format-Table -AutoSize
