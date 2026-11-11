import type { Crop } from "@/lib/crop";

export type Cluster = "shell" | "cloth" | "plaster" | "drawing" | "garment";

export type SamplePlate = {
  id: string;
  title: string;
  cluster: Cluster;
  clusterLabel: string;
  /** Main plates open from the Tangents shelf. Detours are side paths. */
  kind: "main" | "detour";
  detourOf?: string;
  src: string;
  alt: string;
  maker: string;
  license: string;
  credit: string;
  sourceUrl: string;
  sourceLabel: string;
  /** Quiet orientation. Not a suggested answer for what caught the eye. */
  looking: string;
  sidePath: string;
  suggestedCrop: Crop;
};

/**
 * Seeded demo plates. Photographs and drawings are public-domain or
 * Creative Commons files from Wikimedia Commons, kept locally so the
 * prototypes work without a live connection. They are not live research data.
 */
export const plates: SamplePlate[] = [
  {
    id: "shell-section",
    title: "Chamber steps",
    cluster: "shell",
    clusterLabel: "Shell",
    kind: "main",
    src: "/plates/shell-section.jpg",
    alt: "Cross-section of a chambered nautilus shell, with stepped chambers spiraling into a pearly lip.",
    maker: "Emőke Dénes",
    license: "CC BY-SA 4.0",
    credit:
      "Emőke Dénes, CC BY-SA 4.0, via Wikimedia Commons. Cross-section of Nautilus pompilius at the Cambridge University Museum of Zoology.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pu_-_Nautilus_pompilius_-_10.jpg",
    sourceLabel: "Wikimedia Commons · Pu - Nautilus pompilius - 10",
    looking: "A nautilus shell cut open. Look at the steps between the chambers.",
    sidePath: "The same shell, photographed on a blue background.",
    suggestedCrop: { x: 6, y: 18, w: 48, h: 68 },
  },
  {
    id: "shell-blue",
    title: "Blue ground",
    cluster: "shell",
    clusterLabel: "Another picture",
    kind: "detour",
    detourOf: "shell-section",
    src: "/plates/shell-blue.jpg",
    alt: "Nautilus shell cut open to show the spiral chambers, placed on a flat blue background.",
    maker: "Philippe Alès",
    license: "CC BY-SA 4.0",
    credit:
      "Philippe Alès, CC BY-SA 4.0, via Wikimedia Commons. The blue background was added to the photograph.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Inside_Nautilus_Pompilius.jpg",
    sourceLabel: "Wikimedia Commons · Inside Nautilus Pompilius",
    looking: "The same shell again. The blue background was added to the photo.",
    sidePath: "",
    suggestedCrop: { x: 2, y: 28, w: 48, h: 66 },
  },
  {
    id: "kneeling-drape",
    title: "Kneeling drape",
    cluster: "cloth",
    clusterLabel: "Cloth",
    kind: "main",
    src: "/plates/kneeling-drape.jpg",
    alt: "Leonardo da Vinci drapery study: cloth gathered over a kneeling figure, with a hand clutching the fold.",
    maker: "Leonardo da Vinci",
    license: "Public domain",
    credit:
      "Leonardo da Vinci, public domain. British Museum 1895,0915.489. Study of drapery for a kneeling figure.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci_-_1895,0915.489,_A_study_of_drapery_for_a_kneeling_woman.jpg",
    sourceLabel: "Wikimedia Commons · British Museum drapery study",
    looking: "A drawing of heavy cloth. A hand is holding the fold.",
    sidePath: "A fan, where the folds are part of something worn.",
    suggestedCrop: { x: 12, y: 30, w: 38, h: 30 },
  },
  {
    id: "pleated-fan",
    title: "Pleated fan",
    cluster: "garment",
    clusterLabel: "Another picture",
    kind: "detour",
    detourOf: "kneeling-drape",
    src: "/plates/pleated-fan.jpg",
    alt: "An open nineteenth-century French fan with silk, sequins, and ivory sticks radiating from a pivot.",
    maker: "Unknown maker, France",
    license: "Public domain",
    credit:
      "Unknown maker, France, about 1810–1829. Public domain. Cooper Hewitt, Smithsonian Design Museum. Silk gauze, sequins, and ivory sticks.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Pleated_Fan_(France),_1810%E2%80%931829_(CH_18187879).jpg",
    sourceLabel: "Wikimedia Commons · Cooper Hewitt pleated fan",
    looking: "A fan made of silk and sequins. The folds meet at one point.",
    sidePath: "",
    suggestedCrop: { x: 8, y: 16, w: 70, h: 48 },
  },
  {
    id: "plaster-fall",
    title: "Broken hem",
    cluster: "plaster",
    clusterLabel: "Sculpture",
    kind: "main",
    src: "/plates/plaster-fall.jpg",
    alt: "Plaster cast of draped legs, with a torn cloth edge falling over vertical flutes.",
    maker: "Mark Landon",
    license: "CC BY 4.0",
    credit:
      "Plaster cast of the Large Herculaneum Woman, Springfield Museums. Photograph by Mark Landon, CC BY 4.0, via Wikimedia Commons.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Plaster_cast_of_the_Large_Herculaneum_Woman_(Springfield_Mus_50.1900.46)_detail_01.jpg",
    sourceLabel: "Wikimedia Commons · Herculaneum woman plaster cast",
    looking: "A plaster statue. The cloth edge is broken above the straight folds.",
    sidePath: "A red chalk drawing of the same kind of heavy cloth.",
    suggestedCrop: { x: 18, y: 4, w: 64, h: 46 },
  },
  {
    id: "heavy-drape",
    title: "Red chalk weight",
    cluster: "drawing",
    clusterLabel: "Another picture",
    kind: "detour",
    detourOf: "plaster-fall",
    src: "/plates/heavy-drape.jpg",
    alt: "Red chalk drawing of a figure turning under heavy folded cloth.",
    maker: "Unknown artist",
    license: "Public domain",
    credit:
      "Unknown artist, 17th–19th century. Public domain. Cooper Hewitt. Study of a figure in heavy drapery.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Drawing,_Study_of_a_Figure_with_Heavy_Drapery,_17th%E2%80%9319th_century_(CH_18120749).jpg",
    sourceLabel: "Wikimedia Commons · Cooper Hewitt heavy drapery",
    looking: "A red chalk drawing of heavy cloth.",
    sidePath: "",
    suggestedCrop: { x: 16, y: 10, w: 62, h: 46 },
  },
  {
    id: "arm-hand",
    title: "Where the line slows",
    cluster: "drawing",
    clusterLabel: "Drawing",
    kind: "main",
    src: "/plates/arm-hand.jpg",
    alt: "Charcoal study of a foreshortened hand and forearm, with hatching behind the fingers.",
    maker: "Edwin Howland Blashfield",
    license: "Public domain",
    credit:
      "Edwin Howland Blashfield, Study of an arm and hand, 1907. Public domain. Cooper Hewitt, Smithsonian Design Museum.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Drawing,_Study_of_Arm_and_Hand,_1907_(CH_18467919).jpg",
    sourceLabel: "Wikimedia Commons · Blashfield arm and hand",
    looking: "A charcoal drawing of a hand. The line slows down at the knuckles.",
    sidePath: "A linen shirt, cut to fit a body.",
    suggestedCrop: { x: 20, y: 8, w: 52, h: 50 },
  },
  {
    id: "linen-tunic",
    title: "Cut for a body",
    cluster: "garment",
    clusterLabel: "Another picture",
    kind: "detour",
    detourOf: "arm-hand",
    src: "/plates/linen-tunic.jpg",
    alt: "An ancient linen tunic hanging open, with vertical woven bands and deep creases.",
    maker: "Museo Egizio, Turin",
    license: "CC0",
    credit:
      "Linen tunic with vertical bands, Ptolemaic or Roman Egypt. Museo Egizio, Turin. CC0, via Wikimedia Commons.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Cruciform_tunic_with_long_sleeves,_decorated_with_vertical_bands_on_the_body_and_on_the_cuffs,_linen_-_Museo_Egizio_(Turin)_S_17314_p01.jpg",
    sourceLabel: "Wikimedia Commons · Museo Egizio linen tunic",
    looking: "An old linen shirt. The creases are from being worn and from hanging.",
    sidePath: "",
    suggestedCrop: { x: 22, y: 16, w: 52, h: 58 },
  },
];

export function getPlate(id: string) {
  return plates.find((plate) => plate.id === id);
}

export function mainPlates() {
  return plates.filter((plate) => plate.kind === "main");
}

export function detourFor(plateId: string) {
  return plates.find((plate) => plate.detourOf === plateId);
}

export function sourceLine(plate: SamplePlate) {
  return `${plate.maker}. ${plate.license}. ${plate.sourceLabel}.`;
}
