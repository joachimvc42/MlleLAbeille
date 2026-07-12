/* ---------------------------------------------------------------------------
   MlleLAbeille asset pipeline.

   Reads original artwork from  assets/illustrations/originals/<slug>.(png|jpg)
   and produces, for every illustration in the manifest:

     public/illustrations/<slug>/full.webp   1600×1600  (detail page, zoom)
     public/illustrations/<slug>/card.webp    800×800   (cards, grids)
     public/illustrations/<slug>/thumb.webp   320×320   (cart, related)

   Originals are never modified. Illustrations whose original file is
   missing get an elegant generated stand-in (the real bee in a soft
   circular window on the illustration's own background colour) so the
   storefront stays fully browsable. Drop the real file in and re-run:

       npm run assets

   See docs/ASSETS.md.
--------------------------------------------------------------------------- */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORIGINALS = path.join(ROOT, "assets", "illustrations", "originals");
const OUT = path.join(ROOT, "public", "illustrations");
const MANIFEST = path.join(ROOT, "assets", "illustrations", "manifest.json");

/** The reference artwork used to compose placeholders. */
const REFERENCE_SLUG = "abeille-sereine";

const SIZES = [
  { name: "full", size: 1600, quality: 88 },
  { name: "card", size: 800, quality: 84 },
  { name: "thumb", size: 320, quality: 80 },
];

async function findOriginal(slug) {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const file = path.join(ORIGINALS, `${slug}.${ext}`);
    try {
      await fs.access(file);
      return file;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

function circleMask(size) {
  const r = Math.round(size / 2);
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  );
}

/**
 * Placeholder: the illustration's own background colour, a soft ivory halo,
 * and the reference bee in a circular window. Clean, intentional, and
 * clearly replaceable.
 */
async function composePlaceholder(background, referenceFile, size = 1600) {
  const windowSize = Math.round(size * 0.62);
  const haloSize = Math.round(size * 0.7);

  const bee = await sharp(referenceFile)
    .resize(windowSize, windowSize, { fit: "cover" })
    .composite([{ input: circleMask(windowSize), blend: "dest-in" }])
    .png()
    .toBuffer();

  const halo = Buffer.from(
    `<svg width="${haloSize}" height="${haloSize}">
       <circle cx="${haloSize / 2}" cy="${haloSize / 2}" r="${haloSize / 2}"
               fill="#FFFDF6" fill-opacity="0.75"/>
     </svg>`,
  );

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: halo,
        left: Math.round((size - haloSize) / 2),
        top: Math.round((size - haloSize) / 2),
      },
      {
        input: bee,
        left: Math.round((size - windowSize) / 2),
        top: Math.round((size - windowSize) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function processOne(entry, referenceFile) {
  const { slug, background } = entry;
  const original = await findOriginal(slug);
  const dir = path.join(OUT, slug);
  await fs.mkdir(dir, { recursive: true });

  const source = original ?? (await composePlaceholder(background, referenceFile));

  for (const { name, size, quality } of SIZES) {
    await sharp(source)
      .resize(size, size, { fit: "cover", background })
      .webp({ quality })
      .toFile(path.join(dir, `${name}.webp`));
  }

  return { slug, placeholder: !original };
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  const referenceFile = await findOriginal(REFERENCE_SLUG);
  if (!referenceFile) {
    throw new Error(
      `Reference artwork missing: assets/illustrations/originals/${REFERENCE_SLUG}.png`,
    );
  }

  const results = [];
  for (const entry of manifest.illustrations) {
    results.push(await processOne(entry, referenceFile));
  }

  const real = results.filter((r) => !r.placeholder).map((r) => r.slug);
  const stand = results.filter((r) => r.placeholder).map((r) => r.slug);
  console.log(`✔ ${results.length} illustrations processed`);
  console.log(`  originals      : ${real.join(", ") || "—"}`);
  console.log(`  stand-ins      : ${stand.join(", ") || "—"}`);
  if (stand.length) {
    console.log(
      "\nDrop the missing PNG files into assets/illustrations/originals/ " +
        "with the exact slug as filename, then re-run `npm run assets`.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
