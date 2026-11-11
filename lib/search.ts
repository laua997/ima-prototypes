import { getPlate, plates, type SamplePlate } from "@/lib/samples";

export type SearchHit = {
  plateId: string;
  title: string;
  displayUrl: string;
  snippet: string;
  src: string;
  alt: string;
};

const snippets: Record<string, string> = {
  "shell-section": "A shell cut open, with steps between the chambers.",
  "shell-blue": "The same shell, set on a flat blue background.",
  "kneeling-drape": "A drawing of cloth over a kneeling figure. A hand holds one fold.",
  "pleated-fan": "An open fan. The pleats meet at the bottom.",
  "plaster-fall": "A plaster cast. The cloth edge is broken above straight folds.",
  "heavy-drape": "A red chalk drawing of heavy folded cloth.",
  "arm-hand": "A charcoal drawing of a hand and forearm.",
  "linen-tunic": "An old linen shirt with deep creases from being worn.",
};

const topics: { words: string[]; ids: string[] }[] = [
  { words: ["drape", "drapery", "fold", "folds", "cloth", "kneel", "fabric"], ids: ["kneeling-drape", "heavy-drape", "pleated-fan", "linen-tunic"] },
  { words: ["shell", "spiral", "nautilus", "chamber"], ids: ["shell-section", "shell-blue"] },
  { words: ["plaster", "cast", "sculpture", "hem", "statue"], ids: ["plaster-fall", "heavy-drape"] },
  { words: ["hand", "drawing", "line", "charcoal", "arm", "knuckle"], ids: ["arm-hand", "heavy-drape"] },
  { words: ["linen", "tunic", "shirt", "garment"], ids: ["linen-tunic", "pleated-fan"] },
  { words: ["fan", "pleat", "pleats", "silk"], ids: ["pleated-fan", "kneeling-drape"] },
];

function wordsOf(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
}

function hit(plate: SamplePlate, query: string): SearchHit {
  const slug = plate.cluster;
  return {
    plateId: plate.id,
    title: plate.title,
    displayUrl: `sample.page/${slug}/${plate.id}`,
    snippet: snippets[plate.id] ?? `A sample page related to “${query.trim()}”.`,
    src: plate.src,
    alt: plate.alt,
  };
}

export function searchPages(query: string): SearchHit[] {
  const text = query.trim();
  const words = wordsOf(text);
  const ids = new Set<string>();
  if (words.length) {
    for (const topic of topics) {
      if (topic.words.some((word) => words.some((part) => part.startsWith(word) || word.startsWith(part)))) {
        for (const id of topic.ids) ids.add(id);
      }
    }
    for (const plate of plates) {
      const hay = `${plate.title} ${plate.looking} ${plate.alt} ${plate.clusterLabel}`.toLowerCase();
      if (words.some((word) => hay.includes(word))) ids.add(plate.id);
    }
  }
  const chosen = [...ids].map((id) => getPlate(id)).filter((plate): plate is SamplePlate => !!plate);
  const list = chosen.length ? chosen : plates.filter((plate) => plate.kind === "main").slice(0, 4);
  return list.map((plate) => {
    const item = hit(plate, text || "this");
    if (!chosen.length && text) {
      item.snippet = `No close match for “${text}”. This sample page is here so you can still open something.`;
    }
    return item;
  });
}
