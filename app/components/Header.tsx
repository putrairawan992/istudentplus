import { hasValidSession } from "../../lib/auth";
import { getVisibleCountries } from "../study-abroad/data";
import HeaderNav from "./HeaderNav";

// The nav is interactive (mobile menu), so it stays a client component; whether someone is
// signed in can only be read on the server. This wrapper bridges the two, which is why the
// twelve pages that render <Header /> didn't need to change.
//
// The Study Abroad submenu comes from the CMS rather than a list in the client component: it
// used to be hardcoded, so hiding a country or reordering the list meant a code change and
// two places to keep in step with the destination cards.
export default async function Header() {
  const [isAdmin, countries] = await Promise.all([hasValidSession(), getVisibleCountries()]);
  return (
    <HeaderNav
      isAdmin={isAdmin}
      countries={countries.map((c) => ({ label: c.name, slug: c.slug }))}
    />
  );
}
