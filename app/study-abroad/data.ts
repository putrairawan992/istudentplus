import { readContent } from "../../lib/content";

export type CountryOverview = {
  livingCost: string;
  career: string;
  admission: string;
  accommodation: string;
  culture: string;
};

export type Country = {
  slug: string;
  name: string;
  tag: string;
  cities: string;
  gradient: string;
  image?: string;
  imageLabel?: string;
  whyStudy: string;
  overview: CountryOverview;
  featuredPrograms?: { name: string; description: string; href: string }[];
  keyFacts?: { label: string; value: string }[];
  livingCosts?: { expense: string; range: string }[];
  visaRequirements?: string[];
};

export function getCountries(): Promise<Country[]> {
  return readContent<Country[]>("countries");
}

export async function getCountry(slug: string) {
  return (await getCountries()).find((c) => c.slug === slug);
}
