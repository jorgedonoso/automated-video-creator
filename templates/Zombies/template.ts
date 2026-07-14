import type { Template } from "../../src/types/template.js";
import path from "node:path";

export const config: Template = {
  videos_folder: "./videos",
  song_file: path.join(process.cwd(), "/templates/Zombies/Zombies.mp3"),
  clips_durations: [1, 0.8, 0.8, 2.2],
  label: "Zombies Ate My Neighbors — Lame Genie",
  hint: "Fast paced - 4 clips",
};
