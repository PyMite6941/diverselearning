# Demo narration script

Timed to `demo-includai-3min.mp4` (2:47). The shipped narrated cut
(`demo-includai-3min-narrated.mp4`) uses a Windows TTS voice.

**Re-record this in your own voice if you can.** It is a first-person story about how
you learn — a synthetic voice undercuts that, and the judges are scoring presentation.
Reading it aloud takes about three minutes.

The "budget" column is how long each line has before the scene changes. Every line below
already fits with a little room to spare, so read at a normal pace and do not rush.

| # | In at | Budget | Line |
|---|---|---|---|
| 1 | 0:00.6 | 3.4s | When I learn something, I take it apart. |
| 2 | 0:04.6 | 11.4s | Most tools hand you a wall of paragraphs, and expect the taking apart to happen in your head. DiverseLearning starts somewhere else. An empty board. |
| 3 | 0:16.4 | 4.6s | Type any topic you're curious about, and how you learn best. |
| 4 | 0:21.4 | 20.6s | Then the AI does something unusual. It doesn't just write text. It writes a 3D model for every single lesson. Every part positioned, scaled, and labeled. The models are data, not code, so it can build a diagram for a topic nobody ever hand authored. |
| 5 | 0:42.4 | 6.6s | A few seconds later the course exists. Four lessons, each with its own model. |
| 6 | 0:49.4 | 9.6s | Open it, and the lesson is the model. You turn it, you look at it. The text supports it. It isn't the wall. |
| 7 | 0:59.4 | 11.6s | Every lesson gets its own. This one is Earth, with its atmosphere and its orbit. Reading about a thing is one experience. Holding it is another. |
| 8 | 1:11.4 | 35.6s | Here is the part I built for myself. Break apart. The model explodes into its pieces, every one of them labeled, and you click the piece you don't understand to get an explanation of just that piece. That is my actual process. When I learn something, I break it into parts and put it back together, and where a part won't break down any further, that is where I go and research. This is that, as software. |
| 9 | 1:47.4 | 41.6s | And then there is how it reads. Every colour in the interface is yours to change. Not a dark mode. Every channel, so you can build the contrast your eyes actually want. One tap for OpenDyslexic. One tap for roomier text. There is a line reader that highlights the line you are on, numbers down the side so you never lose your place, and text to speech on every lesson. None of this is buried in a settings page. It is one button, always in reach, because a reading support you cannot find is not a support. |
| 10 | 2:29.4 | 11.6s | Everything saves to your account and follows you to any device. The concept library is open to everyone. No sign in, no key, no cost. |
| 11 | 2:41.0 | 5.4s | It is live, and open source. Built by someone who learns this way. |

Lines 8 and 9 finish a few seconds before their scenes end. That is deliberate — the
break-apart and accessibility demos get a moment to breathe with just the music.

## Rebuilding

```bash
# 1. silent cut with captions and cards
bash videos/build-includai-cut.sh

# 2. narration (TTS) — swap the voice with -Voice "Microsoft Zira Desktop"
powershell -File videos/narrate.ps1

# 3. mix narration + music bed onto the silent cut
bash videos/mix-narration.sh
```

To use **your own** recording instead: record the lines as `vo/vo_01.wav` … `vo_11.wav`
(one file per line, no leading silence) and skip step 2. `mix-narration.sh` places each
file at its "In at" time, ducks the music underneath, and loudness-normalises the result
to about -16 LUFS.
