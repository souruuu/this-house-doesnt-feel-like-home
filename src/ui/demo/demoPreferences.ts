// App-session preferences only. D1 persistent profile/read history is not approved.
export interface DemoPreferences {
  readonly textSpeed: number;
  readonly autoForwardSeconds: number;
  readonly instant: boolean;
  readonly reduceMotion: boolean;
}

export function createDemoPreferences(): DemoPreferences {
  return {
    textSpeed: 40,
    autoForwardSeconds: 2,
    instant: false,
    reduceMotion: false,
  };
}

export type DemoInfoPage = 'load' | 'gallery' | 'about';
export type DemoPanel = DemoInfoPage | 'options';
