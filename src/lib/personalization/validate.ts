import type {
  PersonalizationTemplate,
  PersonalizationValues,
} from "@/lib/catalogue/types";

/* Shared client/server validation for personalization inputs. */

export type PersonalizationErrorCode =
  | "required"
  | "tooLong"
  | "invalidChars"
  | "range";

export type PersonalizationErrors = Record<string, PersonalizationErrorCode>;

/** Letters (all alphabets), digits, spaces and gentle punctuation. */
const SUPPORTED_CHARS =
  /^[\p{L}\p{M}\p{N}\s.,'’‘!?()&:;"«»%°+@/–—-]*$/u;

export function validatePersonalization(
  template: PersonalizationTemplate,
  values: PersonalizationValues,
): { ok: boolean; errors: PersonalizationErrors; clean: PersonalizationValues } {
  const errors: PersonalizationErrors = {};
  const clean: PersonalizationValues = {};

  for (const field of template.fields) {
    const raw = (values[field.key] ?? "").trim();

    if (!raw) {
      if (field.required) errors[field.key] = "required";
      continue;
    }

    const maxLength = field.maxLength ?? 200;
    if (raw.length > maxLength) {
      errors[field.key] = "tooLong";
      continue;
    }

    if (
      (field.type === "text" || field.type === "textarea") &&
      !SUPPORTED_CHARS.test(raw)
    ) {
      errors[field.key] = "invalidChars";
      continue;
    }

    if (field.type === "number") {
      const num = Number(raw);
      if (
        !Number.isFinite(num) ||
        (field.min !== undefined && num < field.min) ||
        (field.max !== undefined && num > field.max)
      ) {
        errors[field.key] = "range";
        continue;
      }
    }

    if (field.type === "select" && field.options) {
      if (!field.options.some((o) => o.value === raw)) {
        errors[field.key] = "invalidChars";
        continue;
      }
    }

    clean[field.key] = raw;
  }

  return { ok: Object.keys(errors).length === 0, errors, clean };
}

/** True when at least one meaningful value was entered. */
export function hasPersonalization(values: PersonalizationValues): boolean {
  return Object.values(values).some((v) => v.trim() !== "");
}
