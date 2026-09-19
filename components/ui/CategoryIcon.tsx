import type { CategoryIcon as IconName } from "@/lib/data/categories";
import {
  IconCar,
  IconGym,
  IconHouse,
  IconKey,
  IconLaptop,
  IconMoto,
  IconOther,
  IconPet,
  IconPlane,
  IconStudy,
} from "./icons";

const MAP = {
  car: IconCar,
  house: IconHouse,
  key: IconKey,
  laptop: IconLaptop,
  plane: IconPlane,
  study: IconStudy,
  moto: IconMoto,
  gym: IconGym,
  pet: IconPet,
  other: IconOther,
} as const;

export function CategoryIcon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  const Icon = MAP[name];
  return <Icon size={size} weight="regular" className={className} aria-hidden="true" />;
}
