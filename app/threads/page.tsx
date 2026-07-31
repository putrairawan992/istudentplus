import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { hasValidSession } from "../../lib/auth";
import { listThreads } from "../../lib/threads";
import Board from "./Board";
import AdminLogin from "./AdminLogin";

export const metadata: Metadata = {
  title: "Forum Tanya Jawab",
  description: "Tanya apa saja soal kuliah di luar negeri — tanpa perlu akun.",
};

export default async function ThreadsPage() {
  // An admin browsing the public board sees hidden posts and the moderation controls inline;
  // there's no separate moderation screen to keep in sync.
  const isAdmin = await hasValidSession();
  const posts = await listThreads(isAdmin);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-7 sm:py-14">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Forum Tanya Jawab</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Tanya apa saja soal kuliah di luar negeri, beasiswa, atau visa — tanpa perlu akun. Siapa
          pun boleh menjawab. Tulisan yang kasar atau spam otomatis ditolak.
        </p>
        {isAdmin && (
          <p className="mt-4 rounded-xl bg-paper-raise px-4 py-2.5 text-[13px] font-semibold text-muted">
            Mode admin — kamu bisa menyembunyikan, mengedit, memblokir, dan menghapus tulisan.
            Balasanmu otomatis bertanda “Tim iStudentPlus”.
          </p>
        )}
        <div className="mt-7">
          <Board posts={posts} isAdmin={isAdmin} />
        </div>
        {!isAdmin && <AdminLogin />}
      </main>
      <Footer />
    </>
  );
}
