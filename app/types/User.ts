export interface SessionUser {
  accessToken: string;
  profile: Profile;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}
