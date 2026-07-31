import { hasValidSession } from "../../lib/auth";
import HeaderNav from "./HeaderNav";

// The nav is interactive (mobile menu), so it stays a client component; whether someone is
// signed in can only be read on the server. This wrapper bridges the two, which is why the
// twelve pages that render <Header /> didn't need to change.
export default async function Header() {
  return <HeaderNav isAdmin={await hasValidSession()} />;
}
