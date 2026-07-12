"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useCart } from "@/lib/cart/CartProvider";
import { format } from "@/lib/i18n";
import { formatPrice } from "@/lib/catalogue/types";
import type {
  Illustration,
  PersonalizationTemplate,
  PersonalizationValues,
  ProductType,
} from "@/lib/catalogue/types";
import {
  hasPersonalization,
  validatePersonalization,
  type PersonalizationErrors,
} from "@/lib/personalization/validate";
import { CheckIcon } from "@/components/Icons";

/**
 * The heart of the product discovery model: illustration first, then
 * support, then format, then (optionally) personalization — live preview
 * included — then the cart.
 */
export function ProductConfigurator({
  illustration,
  products,
  template,
}: {
  illustration: Illustration;
  products: ProductType[];
  template: PersonalizationTemplate | null;
}) {
  const { locale, dict } = useI18n();
  const { addItem } = useCart();

  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const product = products.find((p) => p.slug === productSlug) ?? products[0];
  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? "");
  const variant =
    product?.variants.find((v) => v.id === variantId) ?? product?.variants[0];

  const [values, setValues] = useState<PersonalizationValues>({});
  const [errors, setErrors] = useState<PersonalizationErrors>({});
  const [added, setAdded] = useState(false);

  const personalizationActive =
    template !== null && product?.personalizable === true;

  const previewLines = useMemo(() => {
    if (!personalizationActive || !template) return [];
    const lines: string[] = [];
    for (const field of template.fields) {
      if (!field.showInPreview) continue;
      const raw = (values[field.key] ?? "").trim();
      if (!raw) continue;
      if (field.type === "select") {
        const option = field.options?.find((o) => o.value === raw);
        if (option) lines.push(option.label[locale]);
      } else if (field.type === "date") {
        try {
          lines.push(
            new Date(raw).toLocaleDateString(
              locale === "fr" ? "fr-FR" : "en-GB",
              { day: "numeric", month: "long", year: "numeric" },
            ),
          );
        } catch {
          lines.push(raw);
        }
      } else {
        lines.push(raw);
      }
    }
    return lines.slice(0, 3);
  }, [values, template, personalizationActive, locale]);

  function selectProduct(slug: string) {
    setProductSlug(slug);
    const next = products.find((p) => p.slug === slug);
    setVariantId(next?.variants[0]?.id ?? "");
    setAdded(false);
  }

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setAdded(false);
  }

  function errorText(code: string, max?: number): string {
    switch (code) {
      case "required":
        return dict.personalization.fieldRequired;
      case "tooLong":
        return format(dict.personalization.tooLong, { max: max ?? 200 });
      case "range":
        return dict.personalization.invalidChars;
      default:
        return dict.personalization.invalidChars;
    }
  }

  function handleAdd() {
    if (!product || !variant) return;

    let personalization: PersonalizationValues | null = null;
    if (personalizationActive && template && hasPersonalization(values)) {
      const result = validatePersonalization(template, values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      personalization = result.clean;
    }

    addItem({
      illustrationSlug: illustration.slug,
      illustrationTitle: illustration.title,
      thumbSrc: illustration.image.src.replace("/full.webp", "/thumb.webp"),
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      unitPriceCents: variant.priceCents,
      quantity: 1,
      personalization,
    });
    setAdded(true);
  }

  if (!product || !variant) return null;

  const fieldInput =
    "w-full rounded-2xl border border-rose/20 bg-ivory px-4 py-2.5 text-sm placeholder:text-rose-ink/40 focus:border-rose";

  return (
    <div className="space-y-8">
      {/* ------------------------- Support choice ------------------------- */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-rose">
          {dict.illustration.chooseSupport}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {products.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => selectProduct(p.slug)}
              aria-pressed={p.slug === product.slug}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                p.slug === product.slug
                  ? "bg-rose text-ivory shadow-sm"
                  : "border border-rose/25 text-rose-ink hover:border-rose hover:bg-ivory/70"
              }`}
            >
              {p.name[locale]}
              {p.personalizable && template && (
                <span aria-hidden="true" className="ml-1.5 opacity-70">
                  ✎
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-rose-ink/70">
          {product.description[locale]}
        </p>
      </fieldset>

      {/* ------------------------- Variant choice ------------------------- */}
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="font-display text-lg font-semibold text-rose">
            {dict.illustration.chooseVariant}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id);
                  setAdded(false);
                }}
                aria-pressed={v.id === variant.id}
                disabled={!v.available}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  v.id === variant.id
                    ? "bg-honey text-[#5c4321] shadow-sm"
                    : "border border-rose/25 text-rose-ink hover:border-honey"
                }`}
              >
                {v.name[locale]} · {formatPrice(v.priceCents, locale)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* ------------------------ Personalization ------------------------- */}
      {personalizationActive && template && (
        <fieldset className="stitched rounded-[1.8rem] p-6">
          <legend className="font-display px-2 text-lg font-semibold text-rose">
            ✎ {dict.illustration.personalize}
          </legend>
          <p className="relative z-10 text-sm text-rose-ink/80">
            {dict.illustration.personalizeHint}
          </p>

          <div className="relative z-10 mt-4 grid gap-4 sm:grid-cols-2">
            {template.fields.map((field) => {
              const id = `perso-${field.key}`;
              const error = errors[field.key];
              const wide = field.type === "textarea";
              return (
                <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
                  <label
                    htmlFor={id}
                    className="mb-1 block text-sm font-semibold"
                  >
                    {field.label[locale]}
                    {!field.required && (
                      <span className="ml-1 font-normal text-rose-ink/50">
                        ({dict.common.optional})
                      </span>
                    )}
                  </label>

                  {field.type === "select" ? (
                    <select
                      id={id}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className={fieldInput}
                    >
                      <option value="">
                        {dict.personalization.none}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label[locale]}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={id}
                      rows={2}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder?.[locale]}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${id}-error` : undefined}
                      className={fieldInput}
                    />
                  ) : (
                    <input
                      id={id}
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : field.type === "time"
                              ? "time"
                              : "text"
                      }
                      min={field.min}
                      max={field.max}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder?.[locale]}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${id}-error` : undefined}
                      className={fieldInput}
                    />
                  )}

                  {error && (
                    <p
                      id={`${id}-error`}
                      role="alert"
                      className="mt-1 text-xs font-semibold text-rose-deep"
                    >
                      {errorText(error, field.maxLength)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live preview */}
          {previewLines.length > 0 && (
            <div className="relative z-10 mt-6">
              <p className="text-sm font-semibold">
                {dict.personalization.preview}
              </p>
              <div
                className="relative mt-2 overflow-hidden rounded-[1.6rem] shadow-plush"
                style={{ backgroundColor: illustration.image.background }}
              >
                <Image
                  src={illustration.image.src.replace("/full.webp", "/card.webp")}
                  alt=""
                  width={800}
                  height={800}
                  sizes="(max-width: 640px) 90vw, 420px"
                  className="w-full"
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 bg-gradient-to-t from-white/85 via-white/60 to-transparent px-6 pb-5 pt-10 text-center">
                  <span className="font-display text-2xl font-semibold italic text-rose">
                    {previewLines[0]}
                  </span>
                  {previewLines.slice(1).map((line, i) => (
                    <span key={i} className="text-sm text-rose-ink/90">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-rose-ink/60">
                {dict.personalization.previewNote}
              </p>
            </div>
          )}
        </fieldset>
      )}

      {/* ----------------------------- Price + CTA ----------------------------- */}
      <div className="flex flex-wrap items-center gap-5">
        <p className="font-display text-3xl font-semibold text-rose">
          {formatPrice(variant.priceCents, locale)}
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex items-center gap-2.5 px-8 py-4 font-semibold transition-all ${
            added ? "btn-honey" : "btn-rose"
          }`}
        >
          {added ? (
            <>
              <CheckIcon className="h-5 w-5" />
              {dict.illustration.addedToCart}
            </>
          ) : (
            dict.illustration.addToCart
          )}
        </button>
      </div>

      <div className="space-y-1 text-sm text-rose-ink/75">
        <p>🕊 {dict.illustration.shipping}</p>
        <p>🌱 {dict.illustration.shippingNote}</p>
      </div>
    </div>
  );
}
