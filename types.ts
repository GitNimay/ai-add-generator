
export interface Scene {
  sceneNumber: number;
  setting: string;
  action: string;
  dialogue: string;
  sound: string;
}

export interface AdScript {
  title: string;
  tagline: string;
  scenes: Scene[];
}
