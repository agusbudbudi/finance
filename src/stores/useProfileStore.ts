import { create } from "zustand";
import { Profile, ProfileStore } from "../types/profile";
import { StorageService } from "../services/storage/storageService";

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: StorageService.get<Profile>("profile"),

  setProfile: (profile: Profile) => {
    StorageService.set("profile", profile);
    set({ profile });
  },

  updateProfile: (updates: Partial<Profile>) => {
    set((state) => {
      const baseProfile: Profile = state.profile || {
        userId: "user_default",
        name: "User",
        monthlySalary: 0,
        salaryBank: "Unknown",
        salaryDay: 1,
        currency: "IDR",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedProfile = {
        ...baseProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      StorageService.set("profile", updatedProfile);
      return { profile: updatedProfile };
    });
  },
}));
