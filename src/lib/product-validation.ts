import { z } from "zod";

export type AdminLoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type ProductFormState =
  | {
      errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        image?: string[];
        category?: string[];
        additionalInfo?: string[];
        badge?: string[];
        emoji?: string[];
      };
      message?: string;
    }
  | undefined;

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().trim().min(1, "Informe a senha."),
});

const imageValueSchema = z
  .string()
  .trim()
  .min(1, "Informe a URL ou caminho da imagem.")
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//.test(value),
    "Use uma URL completa ou um caminho iniciando com /.",
  );

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  description: z
    .string()
    .trim()
    .min(6, "Descreva melhor o produto para o cliente."),
  price: z
    .number({
      error: "Informe um preco valido.",
    })
    .positive("O preco precisa ser maior que zero."),
  image: imageValueSchema,
  category: z
    .string()
    .trim()
    .min(2, "Informe a categoria do produto."),
  additionalInfo: optionalTextSchema,
  badge: optionalTextSchema.refine(
    (value) => !value || value.length <= 24,
    "O selo deve ter no maximo 24 caracteres.",
  ),
  emoji: optionalTextSchema.refine(
    (value) => !value || value.length <= 8,
    "Use um emoji curto ou deixe em branco.",
  ),
  isAvailable: z.boolean(),
  featured: z.boolean(),
});

export type ProductInput = z.infer<typeof productFormSchema>;

function normalizePrice(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  return Number(value.replace(",", "."));
}

export function parseProductFormData(formData: FormData) {
  return productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: normalizePrice(formData.get("price")),
    image: formData.get("image"),
    category: formData.get("category"),
    additionalInfo: formData.get("additionalInfo"),
    badge: formData.get("badge"),
    emoji: formData.get("emoji"),
    isAvailable: formData.get("isAvailable") === "on",
    featured: formData.get("featured") === "on",
  });
}
