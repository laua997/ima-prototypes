"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlateImage } from "@/components/plate-image";
import { Opening, TangentsFrame } from "@/components/tangents/frame";
import { useRequiredSession } from "@/components/tangents/use-tangents";
import { Button } from "@/components/ui/button";
import { getPlate } from "@/lib/samples";
import { beforeYouGo, closeSession, visitPlate } from "@/lib/tangents";

export function BeforeScreen() {
  const { value, commit, ready, reset } = useRequiredSession();
  const router = useRouter();

  if (!ready || !value.startedAt) {
    return (
      <TangentsFrame onReset={reset}>
        <Opening />
      </TangentsFrame>
    );
  }

  const offer = beforeYouGo(value);
  const parent = offer?.detourOf ? getPlate(offer.detourOf) : undefined;

  return (
    <TangentsFrame state={value} onReset={reset} glow>
      <section className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-20">
        <p className="font-grotesk text-xs tracking-[0.16em] uppercase">Before you finish</p>
        <h1 className="mt-3 font-grotesk text-4xl font-medium tracking-tight">You can stop here.</h1>
        {offer ? (
          <>
            <p className="mt-5 max-w-prose text-lg leading-relaxed">
              You already opened {parent ? parent.title : "a picture"}. {offer.title} is another picture you can open. You do not have to.
            </p>
            <div className="mt-8 flex flex-col gap-4 bg-white p-3 shadow-[0_12px_30px_rgba(40,32,20,0.05)] sm:flex-row">
              <PlateImage src={offer.src} alt={offer.alt} className="h-40 w-full object-cover sm:w-52" />
              <div>
                <p className="font-grotesk text-xs tracking-[0.14em] uppercase">Another picture</p>
                <h2 className="mt-1 font-grotesk text-2xl">{offer.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#3f3a34]">{offer.looking}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => {
                  commit(closeSession(value));
                  router.push("/tangents/map");
                }}
              >
                Finish browsing
              </Button>
              <Button
                type="button"
                variant="line"
                onClick={() => {
                  commit(visitPlate(value, offer.id, { markNudge: true }));
                  router.push(`/tangents/plate/${offer.id}`);
                }}
              >
                Open this picture
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-5 max-w-prose text-lg leading-relaxed">
              {value.visits.length === 0
                ? "You have not opened any pictures yet."
                : "You already opened the other picture. You can finish now."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {value.visits.length === 0 ? (
                <Button asChild>
                  <Link href="/tangents/field">Back to the pictures</Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant={value.visits.length === 0 ? "line" : "ink"}
                onClick={() => {
                  commit(closeSession(value));
                  router.push("/tangents/map");
                }}
              >
                Finish browsing
              </Button>
            </div>
          </>
        )}
      </section>
    </TangentsFrame>
  );
}
