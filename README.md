# Automated Video Creator

I built this tool to create video edits with code using `ffmpeg` and `ffprobe`.

## Demo

Timeless template:

[![Timeless template](https://img.youtube.com/vi/m8qgTnu3zEg/maxresdefault.jpg)](https://youtube.com/shorts/m8qgTnu3zEg)

Zombies template:
[![Zombies template](https://img.youtube.com/vi/Gl9ohZIQhBc/maxresdefault.jpg)](https://youtube.com/shorts/Gl9ohZIQhBc)

To create your own templates, add a folder under `/templates` and create a `template.ts` file with the following structure:

```ts
export const config: template = {
  videos_folder: "./videos", // Place your videos here.
  song_file: "forever-alone.mp3", // Background music for the video.
  clips_durations: [1, 2.1, 3, 3, 3], // Duration in seconds for each clip.
  label: "The best template", // Name shown when selecting a template.
  hint: "Mellow music - 7 clips", // Additional information for the option.
};
```

## Getting Started

Make sure `ffmpeg` and `ffprobe` are installed.

```bash
npm install
# Add your video clips to the /videos folder
npm run start
```

### Template Selection

```bash
◆  Pick a template:
│  ● Timeless — Lauren Duski (Mellow music - 7 clips)
│  ○ Zombies Ate My Neighbors — Lame Genie
│  ↑/↓ to navigate • Enter: confirm
└
```

## Generated Command

This tool takes preconfigured templates (defining the videos folder, background music, and clip durations) and dynamically generates an `ffmpeg` command like this one:

```bash
ffmpeg -y -i videos/ProjectEditData_791888432.546614_235021770195764.mp4 -i videos/ProjectEditData_791888730.426753_285971770196014.mp4 -i videos/USA-November - 53.mov -i videos/USA-November - 54.mov -i ./song.mp3 -filter_complex [0:v]trim=duration=1.1,setpts=PTS-STARTPTS[v0];[0:a]atrim=duration=1.1,asetpts=PTS-STARTPTS[a0];[1:v]trim=duration=0.8,setpts=PTS-STARTPTS[v1];[1:a]atrim=duration=0.8,asetpts=PTS-STARTPTS[a1];[2:v]trim=duration=0.8,setpts=PTS-STARTPTS[v2];[2:a]atrim=duration=0.8,asetpts=PTS-STARTPTS[a2];[3:v]trim=duration=2,setpts=PTS-STARTPTS[v3];[3:a]atrim=duration=2,asetpts=PTS-STARTPTS[a3];[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[vconcat][aconcat];[vconcat]trim=duration=4.702042,setpts=PTS-STARTPTS[v];[4:a]atrim=duration=4.702042,asetpts=PTS-STARTPTS[music];[aconcat]atrim=duration=4.702042[clipaudio];[clipaudio][music]amix=inputs=2:duration=first:dropout_transition=2[a] -map [v] -map [a] -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart output/output-1783882947596.mp4
```

### Command Explained

| Argument                                                                 | What it does                                                                                                                                                                       |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-y`                                                                     | Overwrites the output file if it already exists, without prompting.                                                                                                                |
| `-i videos/ProjectEditData_791888432.546614_235021770195764.mp4`         | Adds the first video as **input 0**. It can later be referenced as `[0:v]` (video) and `[0:a]` (audio).                                                                            |
| `-i videos/ProjectEditData_791888730.426753_285971770196014.mp4`         | Adds the second video as **input 1**.                                                                                                                                              |
| `-i videos/USA-November - 53.mov`                                        | Adds the third video as **input 2**.                                                                                                                                               |
| `-i videos/USA-November - 54.mov`                                        | Adds the fourth video as **input 3**.                                                                                                                                              |
| `-i ./song.mp3`                                                          | Adds the MP3 as **input 4**. Only its audio stream (`[4:a]`) is used in the filter graph.                                                                                          |
| `-filter_complex`                                                        | Starts a complex filter graph that trims, concatenates, and mixes multiple video and audio streams.                                                                                |
| `[0:v]trim=duration=1.1,setpts=PTS-STARTPTS[v0]`                         | Takes the video stream from input 0, trims it to **1.1 seconds**, resets timestamps so playback starts at `0`, and labels the result `v0`.                                         |
| `[0:a]atrim=duration=1.1,asetpts=PTS-STARTPTS[a0]`                       | Takes the audio stream from input 0, trims it to **1.1 seconds**, resets timestamps, and labels the result `a0`.                                                                   |
| `[1:v]trim=duration=0.8,setpts=PTS-STARTPTS[v1]`                         | Trims the second video's video stream to **0.8 seconds**, resets timestamps, and labels it `v1`.                                                                                   |
| `[1:a]atrim=duration=0.8,asetpts=PTS-STARTPTS[a1]`                       | Trims the second video's audio stream to **0.8 seconds**, resets timestamps, and labels it `a1`.                                                                                   |
| `[2:v]trim=duration=0.8,setpts=PTS-STARTPTS[v2]`                         | Trims the third video's video stream to **0.8 seconds**, resets timestamps, and labels it `v2`.                                                                                    |
| `[2:a]atrim=duration=0.8,asetpts=PTS-STARTPTS[a2]`                       | Trims the third video's audio stream to **0.8 seconds**, resets timestamps, and labels it `a2`.                                                                                    |
| `[3:v]trim=duration=2,setpts=PTS-STARTPTS[v3]`                           | Trims the fourth video's video stream to **2 seconds**, resets timestamps, and labels it `v3`.                                                                                     |
| `[3:a]atrim=duration=2,asetpts=PTS-STARTPTS[a3]`                         | Trims the fourth video's audio stream to **2 seconds**, resets timestamps, and labels it `a3`.                                                                                     |
| `[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[vconcat][aconcat]`   | Concatenates the four trimmed video/audio pairs into one continuous video stream (`vconcat`) and one continuous audio stream (`aconcat`).                                          |
| `[vconcat]trim=duration=4.702042,setpts=PTS-STARTPTS[v]`                 | Trims the concatenated video to match the MP3 duration (**4.702042 seconds**), resets timestamps, and labels the result as the final video (`v`).                                  |
| `[4:a]atrim=duration=4.702042,asetpts=PTS-STARTPTS[music]`               | Takes the MP3 audio, trims it to **4.702042 seconds**, resets timestamps, and labels it `music`.                                                                                   |
| `[aconcat]atrim=duration=4.702042[clipaudio]`                            | Trims the concatenated clip audio so it matches the duration of the final video and song.                                                                                          |
| `[clipaudio][music]amix=inputs=2:duration=first:dropout_transition=2[a]` | Mixes the concatenated clip audio with the MP3. The output lasts as long as the first input (`clipaudio`) and smoothly fades when one stream ends. The mixed audio is labeled `a`. |
| `-map [v]`                                                               | Selects the filtered video stream labeled `v` as the output video.                                                                                                                 |
| `-map [a]`                                                               | Selects the filtered audio stream labeled `a` as the output audio.                                                                                                                 |
| `-c:v libx264`                                                           | Encodes the video using the H.264 codec (`libx264`).                                                                                                                               |
| `-preset fast`                                                           | Uses the **fast** encoder preset, trading slightly larger file sizes for faster encoding.                                                                                          |
| `-crf 23`                                                                | Uses a Constant Rate Factor of **23**, balancing visual quality and file size. Lower values increase quality (and size); higher values reduce both.                                |
| `-pix_fmt yuv420p`                                                       | Converts the video to the `yuv420p` pixel format, ensuring broad compatibility with browsers, mobile devices, and media players.                                                   |
| `-c:a aac`                                                               | Encodes the output audio using the AAC codec.                                                                                                                                      |
| `-b:a 192k`                                                              | Sets the audio bitrate to **192 kbps**.                                                                                                                                            |
| `-movflags +faststart`                                                   | Moves the MP4 metadata ("moov atom") to the beginning of the file so playback can begin before the entire file has downloaded, improving streaming performance.                    |
| `output/output-1783882947596.mp4`                                        | The destination file where FFmpeg writes the finished video.                                                                                                                       |

## Author

Jorge Donoso

## License

MIT
