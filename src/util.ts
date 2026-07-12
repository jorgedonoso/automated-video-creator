import { execa } from "execa";

export async function getDuration(file: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);

  return Number(stdout);
}

async function hasAudio(file: string): Promise<boolean> {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a",
    "-show_entries",
    "stream=index",
    "-of",
    "csv=p=0",
    file,
  ]);

  return stdout.trim().length > 0;
}

export async function combineVideos(
  inputFiles: string[],
  durations: number[],
  outputFile: string,
  mp3File?: string,
): Promise<void> {
  const audioTracks = await Promise.all(inputFiles.map(hasAudio));

  const args: string[] = ["-y"];

  for (const file of inputFiles) {
    args.push("-i", file);
  }

  const mp3InputIndex = inputFiles.length;

  if (mp3File) {
    args.push("-i", mp3File);
  }

  const filters: string[] = [];
  const concatInputs: string[] = [];

  for (let i = 0; i < inputFiles.length; i++) {
    filters.push(
      `[${i}:v]trim=duration=${durations[i]},setpts=PTS-STARTPTS[v${i}]`,
    );

    if (audioTracks[i]) {
      filters.push(
        `[${i}:a]atrim=duration=${durations[i]},asetpts=PTS-STARTPTS[a${i}]`,
      );
    } else {
      filters.push(
        `anullsrc=r=48000:cl=stereo,atrim=duration=${durations[i]}[a${i}]`,
      );
    }

    concatInputs.push(`[v${i}][a${i}]`);
  }

  // Combine all clips.
  filters.push(
    `${concatInputs.join("")}concat=n=${inputFiles.length}:v=1:a=1[vconcat][aconcat]`,
  );

  if (mp3File) {
    const songDuration = await getAudioDuration(mp3File);

    // Trim video to song length.
    filters.push(
      `[vconcat]trim=duration=${songDuration},setpts=PTS-STARTPTS[v]`,
    );

    // Trim/mix audio to song length.
    filters.push(
      `[${mp3InputIndex}:a]atrim=duration=${songDuration},asetpts=PTS-STARTPTS[music]`,
    );

    filters.push(`[aconcat]atrim=duration=${songDuration}[clipaudio]`);

    filters.push(
      `[clipaudio][music]amix=inputs=2:duration=first:dropout_transition=2[a]`,
    );
  } else {
    filters.push(`[vconcat]copy[v]`);
    filters.push(`[aconcat]copy[a]`);
  }

  args.push(
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    outputFile,
  );

  await execa("ffmpeg", args, {
    stdio: "inherit",
  });
}

async function getAudioDuration(file: string): Promise<number> {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);

  return Number(stdout);
}
