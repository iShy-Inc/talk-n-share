const ANON_ADJECTIVES = [
	"Silent",
	"Misty",
	"Neon",
	"Hidden",
	"Cosmic",
	"Swift",
	"Brave",
	"Calm",
];

const ANON_NOUNS = [
	"Fox",
	"Hawk",
	"Otter",
	"Panda",
	"Comet",
	"Raven",
	"Whale",
	"Falcon",
];

const hashString = (value: string) => {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
	}
	return hash;
};

export const getAnonymousDisplayName = (seed: string) => {
	const hash = hashString(seed);
	const adjective = ANON_ADJECTIVES[hash % ANON_ADJECTIVES.length];
	const noun = ANON_NOUNS[(hash >> 5) % ANON_NOUNS.length];
	const number = 100 + (hash % 900);
	return `${adjective} ${noun} ${number}`;
};
