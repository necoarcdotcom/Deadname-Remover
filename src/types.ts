/**
  * @author: WillHayCode (forked & rewritten by gumi)
  */

export type Gender = {
  gender: string;
};

export type UserSettings = {
  prefGen: Gender;
  oriGen: Gender[];
  enabled: boolean;
  stealthMode: boolean;
  highlight: boolean;
};

export const DEFAULT_SETTINGS: UserSettings = {
  prefGen: {
    gender: '',
  },
  oriGen: [{
    gender: '',
  }],
  enabled: true,
  stealthMode: false,
  highlight: false,
};