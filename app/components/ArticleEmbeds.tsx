"use client";

import { useEffect } from "react";

/**
 * Makes Instagram embeds inside an article body actually appear.
 *
 * Instagram's copy-paste embed is a <blockquote> plus a <script>. The body is injected with
 * dangerouslySetInnerHTML, and scripts injected that way never execute — so without this the
 * blockquote just sits there as a bare caption-and-link forever. Loading embed.js ourselves
 * lets Instagram swap in the real card (and size it, which the script-less iframe form can't).
 *
 * YouTube needs none of this: iframes do render from innerHTML, so a pasted YouTube embed
 * works on the CSS in globals.css alone.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_JS = "https://www.instagram.com/embed.js";

export default function ArticleEmbeds({ html }: { html: string }) {
  // Instagram's own markup carries this class; no Instagram post, no third-party script.
  const hasInstagram = html.includes("instagram-media");

  useEffect(() => {
    if (!hasInstagram) return;

    // Already loaded by an earlier article this session — just re-scan the new body.
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    // One tag per page, so client-side navigation between posts doesn't stack copies.
    let script = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_JS}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = EMBED_JS;
      script.async = true;
      document.body.appendChild(script);
    }
    const onLoad = () => window.instgrm?.Embeds.process();
    script.addEventListener("load", onLoad);
    return () => script?.removeEventListener("load", onLoad);
  }, [hasInstagram, html]);

  return null;
}
