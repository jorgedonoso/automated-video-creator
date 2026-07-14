import type { Template } from "../../src/types/template.js";
import path from "node:path";

export const config: Template = {
  videos_folder: "./videos",
  // Source: YouTube Audio Library (licensed for use under its terms).
  song_file: path.join(
    process.cwd(),
    "/templates/Timeless/Timeless - Lauren Duski.mp3",
  ),
  clips_durations: [2.07, 1.7, 1.83, 1.73, 1.73, 1.83, 3.28],
  label: "Timeless — Lauren Duski",
  hint: "Mellow music - 7 clips",
};
