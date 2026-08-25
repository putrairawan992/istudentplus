import { readContent } from "@/lib/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

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
  /** Kept out of every list on the site, but the page itself still works if someone has the
      link — the client wants UK/USA/Canada out of the way until there's real experience behind
      them, not deleted. Uncheck it in the CMS to bring a country back. */
  hidden?: boolean;
  whyStudy: string;
  overview: CountryOverview;
  featuredPrograms?: { name: string; description: string; href: string }[];
  keyFacts?: { label: string; value: string }[];
  livingCosts?: { expense: string; range: string }[];
  visaRequirements?: string[];
};

export function getCountries(locale: Locale = DEFAULT_LOCALE): Promise<Country[]> {
  return readContent<Country[]>("countries", locale);
}

/**
 * Countries as visitors should see them listed: `hidden` ones filtered out, in the CMS's own
 * order — which is expertise order (Australia, Japan, China), not alphabetical. Use this for
 * every menu, grid and sidebar; use `getCountries` only where a country page has to resolve
 * regardless, e.g. `generateStaticParams`.
 */
export async function getVisibleCountries(locale: Locale = DEFAULT_LOCALE): Promise<Country[]> {
  return (await getCountries(locale)).filter((c) => !c.hidden);
}

export async function getCountry(slug: string, locale: Locale = DEFAULT_LOCALE) {
  return (await getCountries(locale)).find((c) => c.slug === slug);
}
