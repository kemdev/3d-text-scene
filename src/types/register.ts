interface IProfile {
  displayedName: string;
  email: string;
  password: string;
}

type CallbackProfile = (profile: IProfile) => IProfile;

export { IProfile, CallbackProfile };
