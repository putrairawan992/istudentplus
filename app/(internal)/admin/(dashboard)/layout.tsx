import Sidebar from "../components/Sidebar";
import { ToastProvider } from "../components/Toast";
import { readContent } from "@/lib/content";

/**
 * Only the submission times, never the leads themselves: the sidebar is a client component and
 * this collection is visitor names, emails and phone numbers. A timestamp is all the badge
 * needs to count what arrived since the admin last opened the inbox.
 */
async function leadTimes(): Promise<string[]> {
  try {
    const leads = await readContent<{ submittedAt?: string }[]>("leads");
    return leads.map((l) => l.submittedAt).filter((t): t is string => !!t);
  } catch {
    // The CMS must still open when the content API is unreachable — a missing badge is not a
    // reason to show an error page over every collection.
    return [];
  }
}

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper-raise lg:flex">
        <Sidebar leadTimes={await leadTimes()} />
        <main className="flex-1 overflow-x-hidden p-5 sm:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
