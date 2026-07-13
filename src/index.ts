import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getDuration } from "./helpers/ffprobeHelpers.js";
import { combineVideos } from "./helpers/ffmpegHelpers.js";
import { select } from "@clack/prompts";
import type { template } from "./types/template.js";

async function main(project: template) {
  const files = await readdir(project.videos_folder);
  const maxLength = Math.max(...project.clips_durations);

  const videos = files.filter((file) =>
    /\.(mp4|mov|mkv|avi|webm)$/i.test(file),
  );

  // Check lenghts of videos.
  for (const video of videos) {
    const path = join(project.videos_folder, video);
    const duration = await getDuration(path);

    if (duration < maxLength) throw new Error("Some video(s) are too short");
  }

  // Check number of videos.
  if (videos.length < project.clips_durations.length)
    throw new Error("Not enough videos");

  // Reduce video list to what's needed.
  const requiredVideos = videos.slice(0, project.clips_durations.length);

  // Combine videos.
  await combineVideos(
    requiredVideos.map((video) => join(project.videos_folder, video)),
    project.clips_durations,
    join(`output`, `output-${Date.now()}.mp4`),
    project.song_file,
  );
}

const templateSelected = await select({
  message: "Pick a template:",
  options: [
    {
      value: "Timeless",
      label: "Timeless by Lauren Duski",
      hint: "Mellow music - 7 clips",
    },
  ],
});

const templateModule = await import(
  `../templates/${templateSelected.toString()}/template.js`
);

main(templateModule.config).catch(console.error);
