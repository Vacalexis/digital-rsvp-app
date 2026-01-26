/**
 * Dietary options and restrictions model
 * Single source of truth for all dietary-related options
 */

export interface DietaryOption {
  value: string;
  label: string;
}

/**
 * All available dietary restriction options
 */
export const DIETARY_OPTIONS: DietaryOption[] = [
  { value: "none", label: "Nenhuma" },
  { value: "vegetarian", label: "Vegetariano" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Sem glúten" },
  { value: "lactose-free", label: "Sem lactose" },
  { value: "nut-allergy", label: "Alergia a frutos secos" },
  { value: "seafood-allergy", label: "Alergia a marisco" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "other", label: "Outras" },
];

/**
 * Get display label for a dietary value
 */
export function getDietaryLabel(value: string): string {
  if (!value || value === "none") return "";
  const option = DIETARY_OPTIONS.find((o) => o.value === value);
  return option?.label || value;
}

/**
 * Convert dietary choice and custom text to a readable string
 */
export function formatDietaryRestriction(
  choice: string,
  customText?: string
): string {
  if (!choice || choice === "none") return "";
  if (choice === "other") return customText?.trim() || "";
  return getDietaryLabel(choice);
}
