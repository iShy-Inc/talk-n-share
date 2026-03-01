"use client";

import {
	createElement,
	createContext,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
	type ReactNode,
} from "react";

const MUSIC_TRACK_STORAGE_KEY = "talk-n-share-ambient-track-id";
const MUSIC_MOOD_STORAGE_KEY = "talk-n-share-ambient-mood";
const MUSIC_CURRENT_TIME_STORAGE_KEY = "talk-n-share-ambient-current-time";
const MUSIC_VOLUME_STORAGE_KEY = "talk-n-share-ambient-volume";
const MUSIC_SHUFFLE_STORAGE_KEY = "talk-n-share-ambient-shuffle-enabled";
const MUSIC_REPEAT_STORAGE_KEY = "talk-n-share-ambient-repeat-enabled";
const AMBIENT_PLAYER_SYNC_EVENT = "talk-n-share-ambient-player-sync";

export type PlayerMood = "cafe" | "piano" | "rainy";
export type ControlHint = "shuffle" | "repeat" | null;

type Track = {
	id: string;
	title: string;
	artist: string;
	durationLabel: string;
	url: string;
	coverClassName: string;
	moods: PlayerMood[];
	group: "Jazz Cafe" | "Soft Piano";
};

const RELAXING_TRACKS: readonly Track[] = [
	{
		id: "beautiful-dream",
		title: "Beautiful Dream",
		artist: "Diego Nava",
		durationLabel: "1:37",
		url: "https://assets.mixkit.co/music/493/493.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_28%_22%,hsl(44_90%_74%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(42_45%_86%/.72))]",
		moods: ["cafe", "piano"],
		group: "Soft Piano",
	},
	{
		id: "latin-lovers",
		title: "Latin Lovers",
		artist: "Ahjay Stelino",
		durationLabel: "1:35",
		url: "https://assets.mixkit.co/music/39/39.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_32%_24%,hsl(18_92%_66%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(22_55%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "smooth-like-jazz",
		title: "Smooth Like Jazz",
		artist: "Ahjay Stelino",
		durationLabel: "2:38",
		url: "https://assets.mixkit.co/music/24/24.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(228_78%_72%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(230_38%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "lounging-by-moonlight",
		title: "Lounging By Moonlight",
		artist: "Ahjay Stelino",
		durationLabel: "1:34",
		url: "https://assets.mixkit.co/music/40/40.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(258_70%_76%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(258_32%_85%/.72))]",
		moods: ["cafe", "rainy"],
		group: "Jazz Cafe",
	},
	{
		id: "soul-jazz",
		title: "Soul Jazz",
		artist: "Francisco Alvear",
		durationLabel: "2:15",
		url: "https://assets.mixkit.co/music/652/652.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_32%_24%,hsl(340_78%_72%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(338_36%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "upbeat-jazz",
		title: "Upbeat Jazz",
		artist: "Francisco Alvear",
		durationLabel: "1:50",
		url: "https://assets.mixkit.co/music/644/644.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_22%,hsl(200_88%_68%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(205_42%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "romantic-01",
		title: "Romantic 01",
		artist: "Lily J",
		durationLabel: "1:39",
		url: "https://assets.mixkit.co/music/752/752.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_28%_22%,hsl(320_72%_78%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(325_34%_85%/.72))]",
		moods: ["cafe", "rainy"],
		group: "Jazz Cafe",
	},
	{
		id: "romantic-vacation",
		title: "Romantic Vacation",
		artist: "Ahjay Stelino",
		durationLabel: "1:52",
		url: "https://assets.mixkit.co/music/89/89.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(14_86%_72%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(18_42%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "chill-bro",
		title: "Chill Bro",
		artist: "Diego Nava",
		durationLabel: "1:40",
		url: "https://assets.mixkit.co/music/494/494.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_32%_24%,hsl(188_74%_70%/.22),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(192_36%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "jazz-1",
		title: "Jazz 1",
		artist: "Francisco Alvear",
		durationLabel: "2:14",
		url: "https://assets.mixkit.co/music/639/639.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(52_90%_74%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(48_42%_84%/.72))]",
		moods: ["cafe"],
		group: "Jazz Cafe",
	},
	{
		id: "finding-myself",
		title: "Finding Myself",
		artist: "Michael Ramir C.",
		durationLabel: "2:14",
		url: "https://assets.mixkit.co/music/993/993.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_35%_25%,hsl(205_90%_70%/.28),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(220_45%_84%/.75))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "silent-descent",
		title: "Silent Descent",
		artist: "Eugenio Mininni",
		durationLabel: "2:40",
		url: "https://assets.mixkit.co/music/614/614.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(214_76%_76%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(214_34%_86%/.72))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "wedding-01",
		title: "Wedding 01",
		artist: "Francisco Alvear",
		durationLabel: "2:26",
		url: "https://assets.mixkit.co/music/657/657.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_28%_22%,hsl(356_74%_78%/.18),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(352_32%_86%/.72))]",
		moods: ["piano"],
		group: "Soft Piano",
	},
	{
		id: "romantic",
		title: "Romantic",
		artist: "Francisco Alvear",
		durationLabel: "2:39",
		url: "https://assets.mixkit.co/music/659/659.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(332_72%_80%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(336_34%_86%/.72))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "tears-of-joy",
		title: "Tears of Joy",
		artist: "Michael Ramir C.",
		durationLabel: "2:20",
		url: "https://assets.mixkit.co/music/839/839.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_32%_24%,hsl(240_68%_80%/.18),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(244_30%_86%/.72))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "discover",
		title: "Discover",
		artist: "Eugenio Mininni",
		durationLabel: "2:24",
		url: "https://assets.mixkit.co/music/587/587.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_28%_22%,hsl(168_60%_74%/.2),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(170_30%_85%/.72))]",
		moods: ["piano"],
		group: "Soft Piano",
	},
	{
		id: "harp-relax",
		title: "Harp Relax",
		artist: "Francisco Alvear",
		durationLabel: "2:01",
		url: "https://assets.mixkit.co/music/669/669.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_35%_25%,hsl(335_80%_76%/.24),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(330_45%_85%/.72))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "sonor-07",
		title: "Sonor 07",
		artist: "Eugenio Mininni",
		durationLabel: "3:58",
		url: "https://assets.mixkit.co/music/585/585.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_35%_25%,hsl(265_86%_74%/.26),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(270_42%_83%/.72))]",
		moods: ["piano", "rainy"],
		group: "Soft Piano",
	},
	{
		id: "smooth-meditation",
		title: "Smooth Meditation",
		artist: "Arulo",
		durationLabel: "2:34",
		url: "https://assets.mixkit.co/music/324/324.mp3",
		coverClassName:
			"bg-[radial-gradient(circle_at_30%_20%,hsl(160_84%_65%/.28),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(160_40%_85%/.75))]",
		moods: ["rainy"],
		group: "Soft Piano",
	},
] as const;

const DEFAULT_MOOD: PlayerMood = "cafe";

const getTracksForMood = (mood: PlayerMood) =>
	RELAXING_TRACKS.filter((track) => track.moods.includes(mood));

const getStoredNumber = (key: string, fallback: number) => {
	if (typeof window === "undefined") {
		return fallback;
	}

	const rawValue = window.localStorage.getItem(key);
	const parsedValue = rawValue ? Number.parseFloat(rawValue) : fallback;

	if (!Number.isFinite(parsedValue)) {
		return fallback;
	}

	return parsedValue;
};

const getStoredVolume = () => {
	return Math.min(1, Math.max(0, getStoredNumber(MUSIC_VOLUME_STORAGE_KEY, 0.5)));
};

const getStoredCurrentTime = () => {
	return Math.max(0, getStoredNumber(MUSIC_CURRENT_TIME_STORAGE_KEY, 0));
};

const getStoredBoolean = (key: string, fallback = false) => {
	if (typeof window === "undefined") {
		return fallback;
	}

	const rawValue = window.localStorage.getItem(key);
	if (rawValue === null) {
		return fallback;
	}

	return rawValue === "true";
};

const getStoredMood = (): PlayerMood => {
	if (typeof window === "undefined") {
		return DEFAULT_MOOD;
	}

	const rawValue = window.localStorage.getItem(MUSIC_MOOD_STORAGE_KEY);
	if (rawValue === "piano" || rawValue === "rainy" || rawValue === "cafe") {
		return rawValue;
	}

	return DEFAULT_MOOD;
};

const getStoredTrackId = (fallbackMood: PlayerMood) => {
	if (typeof window === "undefined") {
		return getTracksForMood(fallbackMood)[0]?.id ?? RELAXING_TRACKS[0].id;
	}

	const storedTrackId = window.localStorage.getItem(MUSIC_TRACK_STORAGE_KEY);
	if (storedTrackId) {
		const matchedTrack = RELAXING_TRACKS.find((track) => track.id === storedTrackId);
		if (matchedTrack) {
			return matchedTrack.id;
		}
	}

	return getTracksForMood(fallbackMood)[0]?.id ?? RELAXING_TRACKS[0].id;
};

const getTrackById = (trackId: string | null | undefined) =>
	RELAXING_TRACKS.find((track) => track.id === trackId);

const getNextTrackId = (
	activeTracks: readonly Track[],
	currentTrackId: string,
	isShuffleEnabled: boolean,
) => {
	if (activeTracks.length <= 1) {
		return currentTrackId;
	}

	const currentIndex = activeTracks.findIndex((track) => track.id === currentTrackId);
	if (currentIndex < 0) {
		return activeTracks[0].id;
	}

	if (isShuffleEnabled) {
		let nextIndex = currentIndex;
		while (nextIndex === currentIndex) {
			nextIndex = Math.floor(Math.random() * activeTracks.length);
		}
		return activeTracks[nextIndex].id;
	}

	return activeTracks[(currentIndex + 1) % activeTracks.length].id;
};

interface AmbientPlayerSyncDetail {
	sourceId: string;
	trackId?: string;
	mood?: PlayerMood;
	volume?: number;
	isPlaying?: boolean;
	currentTime?: number;
	shuffleEnabled?: boolean;
	repeatEnabled?: boolean;
}

function useAmbientPlayerController() {
	const initialMood = getStoredMood();
	const initialTrackId = getStoredTrackId(initialMood);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const shuffleHistoryRef = useRef<string[]>([]);
	const hintTimeoutRef = useRef<number | null>(null);
	const instanceId = useId();
	const [selectedMood, setSelectedMood] = useState<PlayerMood>(initialMood);
	const [currentTrackId, setCurrentTrackId] = useState(initialTrackId);
	const [isPlaying, setIsPlaying] = useState(true);
	const [currentTime, setCurrentTime] = useState(getStoredCurrentTime);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(getStoredVolume);
	const [lastVolume, setLastVolume] = useState(getStoredVolume);
	const [isShuffleEnabled, setIsShuffleEnabled] = useState(() =>
		getStoredBoolean(MUSIC_SHUFFLE_STORAGE_KEY),
	);
	const [isRepeatEnabled, setIsRepeatEnabled] = useState(() =>
		getStoredBoolean(MUSIC_REPEAT_STORAGE_KEY),
	);
	const [visibleHint, setVisibleHint] = useState<ControlHint>(null);
	const [hasShuffleHistory, setHasShuffleHistory] = useState(false);

	const activeTracks = getTracksForMood(selectedMood);
	const currentTrack =
		activeTracks.find((track) => track.id === currentTrackId) ??
		activeTracks[0] ??
		RELAXING_TRACKS[0];
	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
		};
		const handleLoadStart = () => {
			setCurrentTime(0);
			setDuration(0);
		};
		const handleLoadedMetadata = () => {
			setDuration(audio.duration || 0);
		};
		const handleEnded = () => {
			const tracksForMood = getTracksForMood(selectedMood);
			if (isRepeatEnabled && !isShuffleEnabled) {
				audio.currentTime = 0;
				void audio.play().catch(() => {
					setIsPlaying(false);
				});
				return;
			}

			setCurrentTrackId((current) => {
				const nextTrackId = getNextTrackId(
					tracksForMood,
					current,
					isShuffleEnabled,
				);
				if (isShuffleEnabled && nextTrackId !== current) {
					shuffleHistoryRef.current.push(current);
					setHasShuffleHistory(true);
				}
				return nextTrackId;
			});
		};

		audio.addEventListener("loadstart", handleLoadStart);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("loadstart", handleLoadStart);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [isRepeatEnabled, isShuffleEnabled, selectedMood]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		audio.volume = volume;
	}, [volume]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(MUSIC_TRACK_STORAGE_KEY, currentTrack.id);
		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: { sourceId: instanceId, trackId: currentTrack.id },
			}),
		);
	}, [currentTrack.id, instanceId]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(MUSIC_MOOD_STORAGE_KEY, selectedMood);
		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: { sourceId: instanceId, mood: selectedMood },
			}),
		);
	}, [instanceId, selectedMood]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(
			MUSIC_CURRENT_TIME_STORAGE_KEY,
			String(currentTime),
		);
		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: { sourceId: instanceId, currentTime },
			}),
		);
	}, [currentTime, instanceId]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(volume));
		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: { sourceId: instanceId, volume },
			}),
		);
	}, [instanceId, volume]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(
			MUSIC_SHUFFLE_STORAGE_KEY,
			String(isShuffleEnabled),
		);
		window.localStorage.setItem(
			MUSIC_REPEAT_STORAGE_KEY,
			String(isRepeatEnabled),
		);
		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: {
					sourceId: instanceId,
					shuffleEnabled: isShuffleEnabled,
					repeatEnabled: isRepeatEnabled,
				},
			}),
		);
	}, [instanceId, isRepeatEnabled, isShuffleEnabled]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		window.dispatchEvent(
			new CustomEvent<AmbientPlayerSyncDetail>(AMBIENT_PLAYER_SYNC_EVENT, {
				detail: { sourceId: instanceId, isPlaying },
			}),
		);
	}, [instanceId, isPlaying]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleSync = (event: Event) => {
			const customEvent = event as CustomEvent<AmbientPlayerSyncDetail>;
			const detail = customEvent.detail;

			if (!detail || detail.sourceId === instanceId) {
				return;
			}

			if (detail.mood) {
				shuffleHistoryRef.current = [];
				setHasShuffleHistory(false);
				setCurrentTime(0);
				setSelectedMood(detail.mood);
			}

			if (typeof detail.trackId === "string") {
				const syncedTrack = getTrackById(detail.trackId);
				if (syncedTrack) {
					setCurrentTrackId(syncedTrack.id);
				}
			}

			if (typeof detail.currentTime === "number") {
				const audio = audioRef.current;
				if (audio && Math.abs(audio.currentTime - detail.currentTime) > 1.2) {
					audio.currentTime = detail.currentTime;
				}
				setCurrentTime(detail.currentTime);
			}

			if (typeof detail.volume === "number") {
				setVolume(detail.volume);
				if (detail.volume > 0) {
					setLastVolume(detail.volume);
				}
			}

			if (typeof detail.isPlaying === "boolean") {
				setIsPlaying(detail.isPlaying);
			}

			if (typeof detail.shuffleEnabled === "boolean") {
				setIsShuffleEnabled(detail.shuffleEnabled);
				if (!detail.shuffleEnabled) {
					shuffleHistoryRef.current = [];
					setHasShuffleHistory(false);
				}
			}

			if (typeof detail.repeatEnabled === "boolean") {
				setIsRepeatEnabled(detail.repeatEnabled);
			}
		};

		window.addEventListener(AMBIENT_PLAYER_SYNC_EVENT, handleSync);

		return () => {
			window.removeEventListener(AMBIENT_PLAYER_SYNC_EVENT, handleSync);
		};
	}, [instanceId]);

	useEffect(() => {
		return () => {
			if (hintTimeoutRef.current) {
				window.clearTimeout(hintTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const restoreCurrentTime = () => {
			const storedTrackId = typeof window === "undefined"
				? currentTrack.id
				: window.localStorage.getItem(MUSIC_TRACK_STORAGE_KEY);
			const storedTime = getStoredCurrentTime();

			if (storedTrackId !== currentTrack.id || storedTime <= 0) {
				return;
			}

			const safeTime = Math.min(
				storedTime,
				Math.max(0, (audio.duration || storedTime) - 0.25),
			);

			audio.currentTime = safeTime;
			setCurrentTime(safeTime);
		};

		audio.addEventListener("loadedmetadata", restoreCurrentTime);
		audio.load();

		return () => {
			audio.removeEventListener("loadedmetadata", restoreCurrentTime);
		};
	}, [currentTrack.id]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (!isPlaying) {
			audio.pause();
			return;
		}

		void audio.play().catch(() => {
			setIsPlaying(false);
		});
	}, [currentTrack.id, isPlaying]);

	useEffect(() => {
		if (typeof window === "undefined" || !("mediaSession" in navigator)) {
			return;
		}

		const handlePlay = () => {
			const audio = audioRef.current;
			if (!audio) {
				return;
			}

			void audio.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch(() => {
					setIsPlaying(false);
				});
		};

		const handlePause = () => {
			const audio = audioRef.current;
			if (!audio) {
				return;
			}

			audio.pause();
			setIsPlaying(false);
		};

		const handleNextTrack = () => {
			const tracksForMood = getTracksForMood(selectedMood);
			setCurrentTrackId((current) => {
				const nextTrackId = getNextTrackId(
					tracksForMood,
					current,
					isShuffleEnabled,
				);
				if (isShuffleEnabled && nextTrackId !== current) {
					shuffleHistoryRef.current.push(current);
					setHasShuffleHistory(true);
				}
				return nextTrackId;
			});
		};

		const handlePreviousTrack = () => {
			const tracksForMood = getTracksForMood(selectedMood);

			if (isShuffleEnabled && shuffleHistoryRef.current.length > 0) {
				const previousTrackId = shuffleHistoryRef.current.pop();
				setHasShuffleHistory(shuffleHistoryRef.current.length > 0);
				if (typeof previousTrackId === "string") {
					setCurrentTrackId(previousTrackId);
					return;
				}
			}

			const currentIndex = tracksForMood.findIndex(
				(track) => track.id === currentTrack.id,
			);
			if (currentIndex < 0) {
				setCurrentTrackId(tracksForMood[0]?.id ?? RELAXING_TRACKS[0].id);
				return;
			}

			setCurrentTrackId(
				tracksForMood[
					(currentIndex - 1 + tracksForMood.length) % tracksForMood.length
				]?.id ?? RELAXING_TRACKS[0].id,
			);
		};

		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentTrack.title,
			artist: currentTrack.artist,
			album: selectedMood === "rainy" ? "Rainy Session" : currentTrack.group,
		});
		navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

		navigator.mediaSession.setActionHandler("play", handlePlay);
		navigator.mediaSession.setActionHandler("pause", handlePause);
		navigator.mediaSession.setActionHandler("nexttrack", handleNextTrack);
		navigator.mediaSession.setActionHandler("previoustrack", handlePreviousTrack);

		return () => {
			if (!("mediaSession" in navigator)) {
				return;
			}

			navigator.mediaSession.setActionHandler("play", null);
			navigator.mediaSession.setActionHandler("pause", null);
			navigator.mediaSession.setActionHandler("nexttrack", null);
			navigator.mediaSession.setActionHandler("previoustrack", null);
		};
	}, [currentTrack, isPlaying, isShuffleEnabled, selectedMood]);

	const togglePlayback = async () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			return;
		}

		try {
			await audio.play();
			setIsPlaying(true);
		} catch {
			setIsPlaying(false);
		}
	};

	const playNextTrack = () => {
		setCurrentTrackId((current) => {
			const nextTrackId = getNextTrackId(activeTracks, current, isShuffleEnabled);
			if (isShuffleEnabled && nextTrackId !== current) {
				shuffleHistoryRef.current.push(current);
				setHasShuffleHistory(true);
			}
			return nextTrackId;
		});
	};

	const playPreviousTrack = () => {
		if (isShuffleEnabled && shuffleHistoryRef.current.length > 0) {
			const previousTrackId = shuffleHistoryRef.current.pop();
			setHasShuffleHistory(shuffleHistoryRef.current.length > 0);
			if (typeof previousTrackId === "string") {
				setCurrentTrackId(previousTrackId);
				return;
			}
		}

		const currentIndex = activeTracks.findIndex((track) => track.id === currentTrack.id);
		if (currentIndex < 0) {
			setCurrentTrackId(activeTracks[0]?.id ?? RELAXING_TRACKS[0].id);
			return;
		}

		setCurrentTrackId(
			activeTracks[
				(currentIndex - 1 + activeTracks.length) % activeTracks.length
			]?.id ?? RELAXING_TRACKS[0].id,
		);
	};

	const toggleRepeat = () => {
		setIsRepeatEnabled((current) => !current);
	};

	const toggleShuffle = () => {
		setIsShuffleEnabled((current) => {
			const nextValue = !current;
			if (!nextValue) {
				shuffleHistoryRef.current = [];
				setHasShuffleHistory(false);
			}
			return nextValue;
		});
	};

	const setMood = (nextMood: PlayerMood) => {
		shuffleHistoryRef.current = [];
		setHasShuffleHistory(false);
		setCurrentTime(0);
		setSelectedMood(nextMood);
	};

	const handleVolumeChange = (nextValue: number) => {
		setVolume(nextValue);
		if (nextValue > 0) {
			setLastVolume(nextValue);
		}
	};

	const showHint = (hint: Exclude<ControlHint, null>) => {
		setVisibleHint(hint);
		if (hintTimeoutRef.current) {
			window.clearTimeout(hintTimeoutRef.current);
		}
		hintTimeoutRef.current = window.setTimeout(() => {
			setVisibleHint(null);
		}, 1200);
	};

	const toggleMute = () => {
		if (volume <= 0) {
			handleVolumeChange(lastVolume > 0 ? lastVolume : 0.5);
			return;
		}

		setLastVolume(volume);
		handleVolumeChange(0);
	};

	return {
		audioRef,
		currentTrack,
		currentTime,
		duration,
		progress,
		volume,
		isPlaying,
		isShuffleEnabled,
		isRepeatEnabled,
		selectedMood,
		visibleHint,
		togglePlayback,
		playNextTrack,
		playPreviousTrack,
		toggleShuffle,
		toggleRepeat,
		toggleMute,
		handleVolumeChange,
		showHint,
		setMood,
	};
}

type AmbientPlayerController = ReturnType<typeof useAmbientPlayerController>;

const AmbientPlayerContext = createContext<AmbientPlayerController | null>(null);

export function AmbientPlayerProvider({ children }: { children: ReactNode }) {
	const player = useAmbientPlayerController();

	return createElement(
		AmbientPlayerContext.Provider,
		{ value: player },
		children,
		createElement(
			"audio",
			{ ref: player.audioRef, preload: "none" },
			createElement("source", {
				src: player.currentTrack.url,
				type: "audio/mpeg",
			}),
		),
	);
}

export function useAmbientPlayer() {
	const context = useContext(AmbientPlayerContext);

	if (!context) {
		throw new Error("useAmbientPlayer must be used within AmbientPlayerProvider");
	}

	return context;
}
