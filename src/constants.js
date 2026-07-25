import { Tv, Clapperboard, MoreHorizontal, Heart, ThumbsUp, Meh, ThumbsDown } from "lucide-react";
import { ACCENT } from "./theme";

export const STATUS = {
  want: { label: "Want to Watch", short: "Want", color: ACCENT },
  watching: { label: "Watching", short: "Watching", color: "#4FA8A0" },
  watched: { label: "Watched", short: "Watched", color: "#8A93A3" },
};

export const CONTENT_TYPE = {
  tv: { label: "TV Show", short: "TV", Icon: Tv },
  movie: { label: "Movie", short: "Movie", Icon: Clapperboard },
  other: { label: "Other", short: "Other", Icon: MoreHorizontal },
};

export const RATINGS = {
  loved: { label: "Loved", color: "#E8546E", Icon: Heart },
  liked: { label: "Liked", color: "#5FB88F", Icon: ThumbsUp },
  meh: { label: "Meh", color: "#C9A44E", Icon: Meh },
  disliked: { label: "Disliked", color: "#6B7280", Icon: ThumbsDown },
};
