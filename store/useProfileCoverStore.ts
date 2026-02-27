import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileCoverState {
	coverNonceByUser: Record<string, number>;
	bumpCoverNonce: (userKey: string) => void;
}

export const useProfileCoverStore = create<ProfileCoverState>()(
	persist(
		(set) => ({
			coverNonceByUser: {},
			bumpCoverNonce: (userKey) =>
				set((state) => ({
					coverNonceByUser: {
						...state.coverNonceByUser,
						[userKey]: (state.coverNonceByUser[userKey] ?? 0) + 1,
					},
				})),
		}),
		{
			name: "talk-n-share-cover-store",
		},
	),
);
