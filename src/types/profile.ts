export interface Profile {
  userId: string;
  name: string;
  monthlySalary: number;
  salaryBank: string;
  salaryDay: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}
