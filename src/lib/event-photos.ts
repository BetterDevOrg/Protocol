export type EventPhotoFit = "cover" | "contain";

export type EventPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Use `contain` for portrait shots so the full subject stays visible. */
  fit?: EventPhotoFit;
};

/** Drop JPG/PNG files into `public/images/events/` using these filenames. */
export const EVENT_PHOTOS: EventPhoto[] = [
  {
    src: "/images/events/meetup-01.jpg",
    alt: "BetterDev community with welcome banner",
    caption: "Welcome to the community",
  },
  {
    src: "/images/events/meetup-02.jpg",
    alt: "Engineers at BetterDev meetup",
    caption: "Monthly decentralized meetup",
    fit: "contain",
  },
  {
    src: "/images/events/meetup-03.jpg",
    alt: "Group photo with BD sashes",
    caption: "Built in public, together",
  },
  {
    src: "/images/events/meetup-04.jpg",
    alt: "Coffee and conversations",
    caption: "Coffee & meaningful talk",
  },
  {
    src: "/images/events/meetup-05.jpg",
    alt: "Engineers talking at the table",
    caption: "High-signal conversations",
  },
  {
    src: "/images/events/meetup-06.jpg",
    alt: "Community walk",
    caption: "Walk + connect",
  },
  {
    src: "/images/events/meetup-07.jpg",
    alt: "Meetup at the venue",
    caption: "Your city, your crew",
    fit: "contain",
  },
  {
    src: "/images/events/meetup-08.jpg",
    alt: "BetterDev event moment",
    caption: "Real connections offline",
  },
];
