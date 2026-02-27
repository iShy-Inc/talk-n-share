import { create } from "zustand";

interface ProfileCoverState {
	coverNonceBySession: Record<string, number>;
	bumpCoverNonce: (sessionKey: string) => void;
}

export const useProfileCoverStore = create<ProfileCoverState>((set) => ({
	coverNonceBySession: {},
	bumpCoverNonce: (sessionKey) =>
		set((state) => ({
			coverNonceBySession: {
				...state.coverNonceBySession,
				[sessionKey]: (state.coverNonceBySession[sessionKey] ?? 0) + 1,
			},
		})),
}));
