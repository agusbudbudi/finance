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
      if (!state.profile) return state;

      const updatedProfile = {
        ...state.profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      StorageService.set("profile", updatedProfile);
      return { profile: updatedProfile };
    });
  },
}));
