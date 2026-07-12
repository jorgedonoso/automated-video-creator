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
): Promise<void> {
  const audioTracks = await Promise.all(inputFiles.map(hasAudio));

  const args: string[] = ["-y"];

  // Add inputs.
  for (const file of inputFiles) {
    args.push("-i", file);
  }

  const filters: string[] = [];
  const concatInputs: string[] = [];

  for (let i = 0; i < inputFiles.length; i++) {
    // Trim video and reset timestamps.
    filters.push(
      `[${i}:v]trim=duration=${durations[i]},setpts=PTS-STARTPTS[v${i}]`,
    );

    // Trim audio or generate silence with helper.
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
    `${concatInputs.join("")}concat=n=${inputFiles.length}:v=1:a=1[v][a]`,
  );

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
