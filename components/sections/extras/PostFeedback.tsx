"use client";
import Link from "next/link";
import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { track } from "@/lib/analytics";

/** One-tap feedback under a post. The answer is sent as an analytics event only; nothing is stored by the site. */
export default function PostFeedback({ slug }: { slug: string }) {
  const [vote, setVote] = useState<null | "yes" | "no">(null);
  const send = (v: "yes" | "no") => { setVote(v); track("post_feedback", { slug, useful: v }); };
  return (
    <div className="glass spot mt-12 flex flex-wrap items-center justify-between gap-5 p-6" data-loc="post-feedback">
      <p className="font-display text-[20px] font-semibold" id="fb-q">Was this guide useful?</p>
      {vote === null ? (
        <div className="flex gap-2" role="group" aria-labelledby="fb-q">
          <button type="button" onClick={() => send("yes")} className="btn btn-glass !min-h-[44px]"><ThumbsUp size={16} aria-hidden /> Yes</button>
          <button type="button" onClick={() => send("no")} className="btn btn-glass !min-h-[44px]"><ThumbsDown size={16} aria-hidden /> Not really</button>
        </div>
      ) : (
        <p role="status" aria-live="polite" className="text-[15.5px] text-mid">
          {vote === "yes" ? "Thanks — glad it helped. " : "Thanks — that helps us improve it. "}
          <Link href="/contact/" className="text-accent-2 underline underline-offset-4">Ask Het a question →</Link>
        </p>
      )}
    </div>
  );
}
