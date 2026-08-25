import { hasValidSession } from "../../lib/auth";
import { getVisibleCountries } from "@/lib/countries";
import { CATEGORY_SLUGS, categoryLabel } from "@/lib/blog";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import HeaderNav from "./HeaderNav";

// The nav is interactive (mobile menu), so it stays a client component; whether someone is
// signed in can only be read on the server. This wrapper bridges the two, which is why the
// twelve pages that render <Header /> didn't need to change.
//
// The Study Abroad submenu comes from the CMS rather than a list in the client component: it
// used to be hardcoded, so hiding a country or reordering the list meant a code change and
// two places to keep in step with the destination cards.
//
// Only the slices of the dictionary the nav actually renders are passed down — the client
// bundle has no reason to carry the whole site's copy.
export default async function Header({ lang }: { lang: Locale }) {
  const [isAdmin, countries, d] = await Promise.all([
    hasValidSession(),
    getVisibleCountries(),
    getDictionary(lang),
  ]);
  return (
    <HeaderNav
      isAdmin={isAdmin}
      locale={lang}
      d={{ nav: d.nav, language: d.language, common: { bookFreeConsultation: d.common.bookFreeConsultation } }}
      countries={countries.map((c) => ({ label: c.name, slug: c.slug }))}
      categories={CATEGORY_SLUGS.map((slug) => ({
        slug,
        label: categoryLabel(slug, d.blog.categories),
      }))}
    />
  );
}
