import { z } from "zod";
import { normalizePhoneNumber } from "@/src/lib/order-presentation";

export type RestaurantWhatsappFormState =
  | {
      errors?: {
        whatsappNumber?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

const restaurantWhatsappFormSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .min(8, "Informe um WhatsApp valido.")
    .transform((value) => normalizePhoneNumber(value))
    .refine(
      (value) =>
        value.startsWith("55") && (value.length === 12 || value.length === 13),
      "Use um numero com DDD. Ex.: +55 (85) 98234-2161.",
    ),
});

export function parseRestaurantWhatsappFormData(formData: FormData) {
  return restaurantWhatsappFormSchema.safeParse({
    whatsappNumber: formData.get("whatsappNumber"),
  });
}
