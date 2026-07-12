export const template1: template = {
  videos_folder: "./videos",
  song_file: "./song.mp3",
  clips_durations: [1.1, 1, 1, 4],
};

type template = {
  videos_folder: string;
  song_file: string;
  clips_durations: number[];
};
