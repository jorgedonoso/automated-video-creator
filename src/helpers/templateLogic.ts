import { readdir } from "node:fs/promises";
import path, { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { template } from "../types/template.js";
import { getDuration } from "./ffprobeHelpers.js";
import { combineVideos } from "./ffmpegHelpers.js";

// Read and load all folders under /templates.
export async function loadTemplates() {
  const templatesDir = path.join(process.cwd(), "templates");

  const folders = await readdir(templatesDir, {
    withFileTypes: true,
  });

  const templates = [];

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;

    const templatePath = path.join(templatesDir, folder.name, "template.js");
    const module = await import(pathToFileURL(templatePath).href);

    templates.push(module.config);
  }

  return templates;
}

export async function main(project: template) {
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
