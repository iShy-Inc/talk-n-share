import man from "@/assets/img/avatars/man.png";
import man2 from "@/assets/img/avatars/man2.png";
import man3 from "@/assets/img/avatars/man3.png";
import man4 from "@/assets/img/avatars/man4.png";
import woman from "@/assets/img/avatars/woman.png";
import woman2 from "@/assets/img/avatars/woman2.png";
import woman3 from "@/assets/img/avatars/woman3.png";
import woman4 from "@/assets/img/avatars/woman4.png";
import cat from "@/assets/img/avatars/cat.png";
import dog from "@/assets/img/avatars/dog.png";
import dog2 from "@/assets/img/avatars/dog2.png";
import rabbit from "@/assets/img/avatars/rabbit.png";
import chicken from "@/assets/img/avatars/chicken.png";
import bear from "@/assets/img/avatars/bear.png";
import panda from "@/assets/img/avatars/panda.png";
import gorilla from "@/assets/img/avatars/gorilla.png";
import meerkat from "@/assets/img/avatars/meerkat.png";

export type AvatarCategoryKey = "people" | "pets" | "wildlife";

export type AvatarOption = {
	id: string;
	src: string;
	label: string;
};

export type AvatarCategory = {
	key: AvatarCategoryKey;
	label: string;
	avatars: AvatarOption[];
};

export const AVATAR_CATEGORIES: AvatarCategory[] = [
	{
		key: "people",
		label: "People",
		avatars: [
			{ id: "man", src: man.src, label: "Man" },
			{ id: "man2", src: man2.src, label: "Man 2" },
			{ id: "man3", src: man3.src, label: "Man 3" },
			{ id: "man4", src: man4.src, label: "Man 4" },
			{ id: "woman", src: woman.src, label: "Woman" },
			{ id: "woman2", src: woman2.src, label: "Woman 2" },
			{ id: "woman3", src: woman3.src, label: "Woman 3" },
			{ id: "woman4", src: woman4.src, label: "Woman 4" },
		],
	},
	{
		key: "pets",
		label: "Pets",
		avatars: [
			{ id: "cat", src: cat.src, label: "Cat" },
			{ id: "dog", src: dog.src, label: "Dog" },
			{ id: "dog2", src: dog2.src, label: "Dog 2" },
			{ id: "rabbit", src: rabbit.src, label: "Rabbit" },
			{ id: "chicken", src: chicken.src, label: "Chicken" },
		],
	},
	{
		key: "wildlife",
		label: "Wildlife",
		avatars: [
			{ id: "bear", src: bear.src, label: "Bear" },
			{ id: "panda", src: panda.src, label: "Panda" },
			{ id: "gorilla", src: gorilla.src, label: "Gorilla" },
			{ id: "meerkat", src: meerkat.src, label: "Meerkat" },
		],
	},
];

export const getAvatarCategoryForUrl = (url?: string | null): AvatarCategoryKey => {
	if (!url) return "people";
	for (const category of AVATAR_CATEGORIES) {
		if (category.avatars.some((a) => a.src === url)) {
			return category.key;
		}
	}
	return "people";
};
