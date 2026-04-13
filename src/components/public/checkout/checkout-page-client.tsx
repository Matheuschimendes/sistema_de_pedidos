"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import { createOrderAction } from "@/src/app/(public)/[slug]/checkout/actions";
import { fetchAddressByCep, normalizeCep } from "@/src/lib/cep";
import { formatBRL } from "@/src/lib/format";
import {
  getCartFromStorage,
  getCartItemsFromProducts,
} from "@/src/lib/get-cart-items";
import { normalizePhoneNumber } from "@/src/lib/order-presentation";
import {
  getCartStorageKey,
  getCustomerStorageKey,
} from "@/src/lib/storage-keys";
import { CheckoutItem, DeliveryType, PaymentMethod } from "@/src/types/checkout";
import { Product } from "@/src/types/menu";
import { RestaurantProfile } from "@/src/types/restaurant";

type CheckoutPageClientProps = {
  slug: string;
  restaurant: RestaurantProfile;
  products: Product[];
};

type CheckoutStep = "delivery" | "additional" | "identify";
type FormErrors = Partial<
  Record<"address" | "name" | "email" | "phone" | "terms", string>
>;

type DeliveryDraft = {
  state: string;
  city: string;
  district: string;
  zip: string;
  street: string;
  number: string;
  complement: string;
};

type SavedCustomer = {
  name: string;
  phone: string;
  address: string;
  notes: string;
};

const NOTE_MAX = 288;
const ORDER_NOTES_MAX = 280;

const EMPTY_SAVED_CUSTOMER: SavedCustomer = {
  name: "",
  phone: "",
  address: "",
  notes: "",
};

const EMPTY_DELIVERY_DRAFT: DeliveryDraft = {
  state: "CE - Ceara",
  city: "Fortaleza",
  district: "",
  zip: "",
  street: "",
  number: "",
  complement: "",
};

const STATE_OPTIONS = [
  "CE - Ceara",
  "RN - Rio Grande do Norte",
  "PE - Pernambuco",
];

const CITY_OPTIONS_BY_STATE: Record<string, string[]> = {
  CE: ["Fortaleza", "Caucaia", "Maracanau", "Sobral"],
  RN: ["Natal", "Mossoro", "Parnamirim"],
  PE: ["Recife", "Olinda", "Jaboatao"],
};

const STATE_OPTION_BY_CODE = STATE_OPTIONS.reduce<Record<string, string>>(
  (acc, stateLabel) => {
    acc[getStateCode(stateLabel)] = stateLabel;
    return acc;
  },
  {},
);

const CHECKOUT_STEPS: Array<{ id: CheckoutStep; label: string }> = [
  { id: "delivery", label: "Endereco" },
  { id: "additional", label: "Informacoes" },
  { id: "identify", label: "Identificacao" },
];

function getStateCode(value: string) {
  return value.split("-")[0]?.trim() ?? "";
}

function getCityOptions(stateValue: string, currentCity?: string) {
  const stateCode = getStateCode(stateValue);
  const cityOptions = CITY_OPTIONS_BY_STATE[stateCode] ?? [];

  if (currentCity && !cityOptions.includes(currentCity)) {
    return [currentCity, ...cityOptions];
  }

  return cityOptions.length > 0 ? cityOptions : currentCity ? [currentCity] : ["Fortaleza"];
}

function normalizeStoredCustomer(value: unknown): SavedCustomer {
  if (!value || typeof value !== "object") {
    return EMPTY_SAVED_CUSTOMER;
  }

  const candidate = value as Partial<Record<keyof SavedCustomer, unknown>>;

  return {
    name: typeof candidate.name === "string" ? candidate.name : "",
    phone: typeof candidate.phone === "string" ? candidate.phone : "",
    address: typeof candidate.address === "string" ? candidate.address : "",
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
  };
}

function splitStoredPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return { countryCode: "55", phoneNumber: "" };
  }

  if (digits.startsWith("55") && digits.length > 11) {
    return {
      countryCode: "55",
      phoneNumber: digits.slice(2, 13),
    };
  }

  return {
    countryCode: "55",
    phoneNumber: digits.slice(0, 11),
  };
}

function parseDraftFromAddress(address: string): DeliveryDraft {
  if (!address.trim()) {
    return EMPTY_DELIVERY_DRAFT;
  }

  return {
    ...EMPTY_DELIVERY_DRAFT,
    street: address.trim(),
  };
}

function normalizePhoneInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function buildAddressFromDraft(draft: DeliveryDraft) {
  const stateCode = getStateCode(draft.state);
  const cityState = draft.city.trim()
    ? `${draft.city.trim()}${stateCode ? ` - ${stateCode}` : ""}`
    : stateCode;

  const parts = [
    draft.street.trim(),
    draft.number.trim() ? `n ${draft.number.trim()}` : "",
    draft.complement.trim(),
    draft.district.trim(),
    cityState,
    draft.zip.trim() ? `CEP ${draft.zip.trim()}` : "",
  ].filter(Boolean);

  return parts.join(", ");
}

function validateDeliveryDraft(draft: DeliveryDraft) {
  if (!draft.state.trim() || !draft.city.trim()) {
    return "Selecione estado e cidade.";
  }

  if (!draft.district.trim()) {
    return "Informe o bairro da entrega.";
  }

  if (draft.zip.trim().length !== 8) {
    return "Informe um CEP valido com 8 digitos.";
  }

  if (!draft.street.trim()) {
    return "Informe a rua ou avenida da entrega.";
  }

  return null;
}

function validateEmail(value: string) {
  if (!value.trim()) {
    return "Informe seu e-mail.";
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  return validEmail ? null : "Informe um e-mail valido.";
}

function DeliveryTypeOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 sm:gap-3"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition sm:h-9 sm:w-9 ${
          active ? "border-black" : "border-zinc-900"
        }`}
      >
        {active ? <span className="h-4 w-4 rounded-full bg-black" /> : null}
      </span>
      <span
        className={`text-[16px] leading-none sm:text-[17px] ${
          active ? "font-semibold text-zinc-900" : "font-medium text-zinc-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ClearButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 sm:right-4 sm:h-10 sm:w-10"
    >
      <X className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
}

export function CheckoutPageClient({
  slug,
  restaurant,
  products,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>("delivery");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [paymentMethod] = useState<PaymentMethod>("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("55");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [deliveryDraft, setDeliveryDraft] =
    useState<DeliveryDraft>(EMPTY_DELIVERY_DRAFT);
  const [isZipLookupLoading, setIsZipLookupLoading] = useState(false);
  const [zipLookupError, setZipLookupError] = useState<string | null>(null);

  const composedAddress = useMemo(() => {
    return buildAddressFromDraft(deliveryDraft);
  }, [deliveryDraft]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const deliveryFee = useMemo(() => {
    return deliveryType === "delivery" ? restaurant.deliveryFee ?? 0 : 0;
  }, [deliveryType, restaurant.deliveryFee]);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  const notesRemaining = NOTE_MAX - notes.length;
  const currentStepIndex = CHECKOUT_STEPS.findIndex((item) => item.id === step);

  useEffect(() => {
    const cart = getCartFromStorage(getCartStorageKey(slug));
    const items = getCartItemsFromProducts(products, cart);
    let nextSavedCustomer = EMPTY_SAVED_CUSTOMER;
    let nextDraft = EMPTY_DELIVERY_DRAFT;
    let nextEmail = "";

    const savedCustomerRaw = window.localStorage.getItem(getCustomerStorageKey(slug));
    const savedEmailRaw = window.localStorage.getItem(
      `${getCustomerStorageKey(slug)}:email`,
    );

    if (savedCustomerRaw) {
      try {
        nextSavedCustomer = normalizeStoredCustomer(JSON.parse(savedCustomerRaw));
        nextDraft = parseDraftFromAddress(nextSavedCustomer.address);
      } catch {
        nextSavedCustomer = EMPTY_SAVED_CUSTOMER;
        nextDraft = EMPTY_DELIVERY_DRAFT;
      }
    }

    if (savedEmailRaw) {
      nextEmail = savedEmailRaw;
    }

    const parsedPhone = splitStoredPhone(nextSavedCustomer.phone);

    startTransition(() => {
      setCheckoutItems(items);
      setName(nextSavedCustomer.name);
      setNotes(nextSavedCustomer.notes.slice(0, NOTE_MAX));
      setCountryCode(parsedPhone.countryCode);
      setPhoneNumber(parsedPhone.phoneNumber);
      setDeliveryDraft(nextDraft);
      setEmail(nextEmail);
      setHydrated(true);
    });
  }, [products, slug]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: SavedCustomer = {
      name,
      phone: `${countryCode}${phoneNumber}`,
      address: deliveryType === "delivery" ? composedAddress : "",
      notes,
    };

    window.localStorage.setItem(getCustomerStorageKey(slug), JSON.stringify(payload));
    window.localStorage.setItem(`${getCustomerStorageKey(slug)}:email`, email);
  }, [hydrated, slug, name, countryCode, phoneNumber, deliveryType, composedAddress, notes, email]);

  useEffect(() => {
    if (!successOrder) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push(`/${slug}`);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router, slug, successOrder]);

  const updateDeliveryField = (field: keyof DeliveryDraft, value: string) => {
    const nextValue = field === "zip" ? normalizeCep(value) : value;

    setDeliveryDraft((prev) => ({ ...prev, [field]: nextValue }));
    setSubmitError(null);
    setErrors((prev) => ({ ...prev, address: undefined }));

    if (field === "zip") {
      setZipLookupError(null);
    }
  };

  const handleStateChange = (stateValue: string) => {
    const stateCities = getCityOptions(stateValue, deliveryDraft.city);

    setDeliveryDraft((prev) => ({
      ...prev,
      state: stateValue,
      city: stateCities.includes(prev.city) ? prev.city : stateCities[0] ?? "",
    }));

    setSubmitError(null);
    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  const handleDeliveryTypeChange = (value: DeliveryType) => {
    setDeliveryType(value);
    setSubmitError(null);
    setErrors((prev) => ({ ...prev, address: undefined }));
  };

  const handleSearchNewAddress = () => {
    setDeliveryDraft((prev) => ({
      ...prev,
      district: "",
      zip: "",
      street: "",
      number: "",
      complement: "",
    }));
    setSubmitError(null);
    setErrors((prev) => ({ ...prev, address: undefined }));
    setZipLookupError(null);
  };

  const handleLookupZip = async (zipValue = deliveryDraft.zip) => {
    const normalizedZip = normalizeCep(zipValue);

    if (normalizedZip.length !== 8) {
      setZipLookupError("Informe um CEP valido com 8 digitos.");
      return;
    }

    setIsZipLookupLoading(true);
    setZipLookupError(null);

    try {
      const cepAddress = await fetchAddressByCep(normalizedZip);
      const mappedState = STATE_OPTION_BY_CODE[cepAddress.stateCode] ?? deliveryDraft.state;
      const cityOptions = getCityOptions(mappedState, cepAddress.city);

      setDeliveryDraft((prev) => ({
        ...prev,
        zip: cepAddress.zip,
        state: mappedState,
        city: cityOptions.includes(cepAddress.city) ? cepAddress.city : prev.city,
        district: cepAddress.district || prev.district,
        street: cepAddress.street || prev.street,
        complement: cepAddress.complement || prev.complement,
      }));

      setSubmitError(null);
      setErrors((prev) => ({ ...prev, address: undefined }));
    } catch {
      setZipLookupError("Nao foi possivel localizar este CEP. Preencha manualmente.");
    } finally {
      setIsZipLookupLoading(false);
    }
  };

  const validateIdentifyStep = () => {
    const nextErrors: FormErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Informe seu nome completo.";
    }

    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }

    const normalizedPhone = normalizePhoneNumber(`${countryCode}${phoneNumber}`);
    const validPhone =
      normalizedPhone.startsWith("55") &&
      (normalizedPhone.length === 12 || normalizedPhone.length === 13);

    if (!validPhone) {
      nextErrors.phone = "Informe um celular/WhatsApp valido com DDD.";
    }

    if (!termsAccepted) {
      nextErrors.terms = "Voce precisa aceitar os termos para continuar.";
    }

    if (deliveryType === "delivery") {
      const deliveryError = validateDeliveryDraft(deliveryDraft);
      if (deliveryError) {
        nextErrors.address = deliveryError;
      }
    }

    return nextErrors;
  };

  const handleAdvanceFromDelivery = () => {
    if (checkoutItems.length === 0) {
      setSubmitError("Adicione itens ao carrinho para continuar.");
      return;
    }

    if (deliveryType === "delivery") {
      const deliveryError = validateDeliveryDraft(deliveryDraft);
      if (deliveryError) {
        setErrors((prev) => ({ ...prev, address: deliveryError }));
        setSubmitError(deliveryError);
        return;
      }
    }

    setErrors((prev) => ({ ...prev, address: undefined }));
    setSubmitError(null);
    setStep("additional");
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (checkoutItems.length === 0) {
      setSubmitError("Seu carrinho esta vazio.");
      return;
    }

    const stepErrors = validateIdentifyStep();
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setSubmitError("Revise os campos obrigatorios para continuar.");

      if (stepErrors.address) {
        setStep("delivery");
      }
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    const normalizedPhone = normalizePhoneNumber(`${countryCode}${phoneNumber}`);
    const addressToSend = deliveryType === "delivery" ? composedAddress : "";
    const notesToSend = [notes.trim(), email.trim() ? `Email: ${email.trim()}` : ""]
      .filter(Boolean)
      .join(" | ")
      .slice(0, ORDER_NOTES_MAX);

    const result = await createOrderAction({
      slug,
      deliveryType,
      paymentMethod,
      customer: {
        name: name.trim(),
        phone: normalizedPhone || `${countryCode}${phoneNumber}`,
        address: addressToSend.trim(),
        notes: notesToSend,
      },
      items: checkoutItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    });

    if (!result.ok) {
      setSubmitError(result.message);
      setIsSubmitting(false);
      return;
    }

    startTransition(() => {
      window.localStorage.removeItem(getCartStorageKey(slug));
      window.localStorage.removeItem(getCustomerStorageKey(slug));
      window.localStorage.removeItem(`${getCustomerStorageKey(slug)}:email`);
      setSuccessOrder(result.orderNumber);
      setIsSubmitting(false);
    });
  };

  const actionLabel =
    step === "delivery"
      ? `Avancar: ${formatBRL(total)}`
      : step === "additional"
        ? `Continuar: ${formatBRL(total)}`
        : isSubmitting
          ? "Finalizando..."
          : `Finalizar: ${formatBRL(total)}`;

  const actionDisabled =
    checkoutItems.length === 0 ||
    (step === "identify" && (!termsAccepted || isSubmitting));

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#e7e7e7] px-4 py-4 sm:py-5">
        <div className="mx-auto max-w-[640px] rounded-[18px] border border-black/10 bg-white p-5 text-[15px] text-zinc-600 sm:p-6 sm:text-[16px]">
          Carregando checkout...
        </div>
      </main>
    );
  }

  if (successOrder) {
    return (
      <main className="min-h-screen bg-[#e7e7e7] px-4 py-4 sm:py-5">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[640px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[22px] font-semibold text-emerald-700 sm:h-20 sm:w-20 sm:text-[24px]">
            ✓
          </div>
          <h1 className="text-[28px] font-semibold leading-tight text-zinc-900 sm:text-[32px]">
            Pedido feito
          </h1>
          <p className="mt-2 text-[15px] text-zinc-600 sm:text-[16px]">
            Numero: {successOrder}
          </p>
          <p className="mt-1 text-[16px] text-zinc-500 sm:text-[18px]">
            Voltando para o sistema...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#e7e7e7]">
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col">
        <header className="sticky top-0 z-10 bg-[#e7e7e7]/95 px-4 pb-2 pt-5 backdrop-blur-sm sm:px-5 sm:pt-8">
          <div className="flex items-center gap-3">
            {step === "delivery" ? (
              <Link
                href={`/${slug}`}
                className="inline-flex h-9 w-9 items-center justify-center text-zinc-900 transition hover:text-zinc-700 sm:h-10 sm:w-10"
                aria-label="Voltar ao cardapio"
              >
                <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStep(step === "identify" ? "additional" : "delivery");
                  setSubmitError(null);
                }}
                className="inline-flex h-9 w-9 items-center justify-center text-zinc-900 transition hover:text-zinc-700 sm:h-10 sm:w-10"
                aria-label="Voltar etapa"
              >
                <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            )}

            <h1 className="text-[31px] font-semibold leading-none tracking-[-0.02em] text-zinc-900 sm:text-[34px]">
              {step === "delivery"
                ? "Endereco"
                : step === "additional"
                  ? "Informacoes adicionais"
                  : "Identifique-se"}
            </h1>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-zinc-600">
              <span>
                Passo {currentStepIndex + 1} de {CHECKOUT_STEPS.length}
              </span>
              <span>{CHECKOUT_STEPS[currentStepIndex]?.label}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {CHECKOUT_STEPS.map((checkoutStep, index) => (
                <div
                  key={checkoutStep.id}
                  className={`h-1.5 rounded-full transition ${
                    index <= currentStepIndex ? "bg-black" : "bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <section className="flex-1 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-2 sm:px-5 sm:pb-[calc(9rem+env(safe-area-inset-bottom))]">
          {step === "delivery" ? (
            <div className="space-y-6 sm:space-y-7">
              <div className="rounded-[10px] border border-zinc-300 bg-white px-4 py-3 text-[14px] text-zinc-700 sm:rounded-[12px] sm:px-5 sm:text-[15px]">
                Processo de endereco: preencha os dados da entrega para seguir no checkout.
                <div className="mt-1 text-[13px] text-zinc-500 sm:text-[14px]">
                  Tipo selecionado:{" "}
                  {deliveryType === "delivery" ? "Entrega" : "Retirada"}
                </div>
              </div>

              <div className="flex flex-wrap gap-5 pt-1 sm:gap-7 sm:pt-2">
                <DeliveryTypeOption
                  active={deliveryType === "pickup"}
                  label="Retirada"
                  onClick={() => handleDeliveryTypeChange("pickup")}
                />
                <DeliveryTypeOption
                  active={deliveryType === "delivery"}
                  label="Entrega"
                  onClick={() => handleDeliveryTypeChange("delivery")}
                />
              </div>

              {deliveryType === "delivery" ? (
                <>
                  <button
                    type="button"
                    onClick={handleSearchNewAddress}
                    className="inline-flex h-[52px] items-center gap-2.5 rounded-[12px] bg-zinc-300 px-5 text-[15px] font-semibold text-zinc-900 transition hover:bg-zinc-400/70 sm:h-[54px] sm:gap-3 sm:px-6 sm:text-[16px]"
                  >
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                    Buscar novo endereco
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="checkout-state"
                        className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                      >
                        Estado
                      </label>
                      <div className="relative">
                        <select
                          id="checkout-state"
                          value={deliveryDraft.state}
                          onChange={(event) => handleStateChange(event.target.value)}
                          className="h-14 w-full appearance-none rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                        >
                          {STATE_OPTIONS.map((stateOption) => (
                            <option key={stateOption} value={stateOption}>
                              {stateOption}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-700 sm:right-5 sm:h-7 sm:w-7" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                      >
                        Cidade
                      </label>
                      <div className="relative">
                        <select
                          id="checkout-city"
                          value={deliveryDraft.city}
                          onChange={(event) =>
                            updateDeliveryField("city", event.target.value)
                          }
                          className="h-14 w-full appearance-none rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                        >
                          {getCityOptions(deliveryDraft.state, deliveryDraft.city).map((cityOption) => (
                            <option key={cityOption} value={cityOption}>
                              {cityOption}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-700 sm:right-5 sm:h-7 sm:w-7" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-district"
                        className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                      >
                        Bairro
                      </label>
                      <div className="relative">
                        <input
                          id="checkout-district"
                          value={deliveryDraft.district}
                          onChange={(event) =>
                            updateDeliveryField("district", event.target.value)
                          }
                          placeholder="Cristo Redentor"
                          className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                        />
                        {deliveryDraft.district ? (
                          <ClearButton
                            onClick={() => updateDeliveryField("district", "")}
                            label="Limpar bairro"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-zip"
                        className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                      >
                        CEP
                      </label>
                      <div className="relative">
                        <input
                          id="checkout-zip"
                          value={deliveryDraft.zip}
                          onChange={(event) =>
                            updateDeliveryField("zip", event.target.value)
                          }
                          onBlur={(event) => {
                            if (normalizeCep(event.target.value).length === 8) {
                              void handleLookupZip(event.target.value);
                            }
                          }}
                          inputMode="numeric"
                          placeholder="60337350"
                          className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                        />
                        {deliveryDraft.zip ? (
                          <ClearButton
                            onClick={() => updateDeliveryField("zip", "")}
                            label="Limpar CEP"
                          />
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void handleLookupZip();
                          }}
                          disabled={
                            isZipLookupLoading || normalizeCep(deliveryDraft.zip).length !== 8
                          }
                          className="inline-flex h-9 items-center justify-center rounded-[10px] border border-zinc-300 bg-white px-3 text-[13px] font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isZipLookupLoading ? "Buscando CEP..." : "Buscar CEP"}
                        </button>
                        <span className="text-[12px] text-zinc-500">
                          Preenche rua, bairro, cidade e estado automaticamente.
                        </span>
                      </div>
                      {zipLookupError ? (
                        <div className="mt-2 text-[12px] text-red-600">{zipLookupError}</div>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-address"
                        className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                      >
                        Rua/Avenida
                      </label>
                      <div className="relative">
                        <input
                          id="checkout-address"
                          value={deliveryDraft.street}
                          onChange={(event) =>
                            updateDeliveryField("street", event.target.value)
                          }
                          placeholder="Alves de lima"
                          className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                        />
                        {deliveryDraft.street ? (
                          <ClearButton
                            onClick={() => updateDeliveryField("street", "")}
                            label="Limpar rua"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
                      <div>
                        <label
                          htmlFor="checkout-number"
                          className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                        >
                          Numero
                        </label>
                        <div className="relative">
                          <input
                            id="checkout-number"
                            value={deliveryDraft.number}
                            onChange={(event) =>
                              updateDeliveryField("number", event.target.value)
                            }
                            inputMode="numeric"
                            placeholder="417"
                            className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                          />
                          {deliveryDraft.number ? (
                            <ClearButton
                              onClick={() => updateDeliveryField("number", "")}
                              label="Limpar numero"
                            />
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="checkout-complement"
                          className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                        >
                          Complemento (opcional)
                        </label>
                        <div className="relative">
                          <input
                            id="checkout-complement"
                            value={deliveryDraft.complement}
                            onChange={(event) =>
                              updateDeliveryField("complement", event.target.value)
                            }
                            placeholder="casa"
                            className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                          />
                          {deliveryDraft.complement ? (
                            <ClearButton
                              onClick={() =>
                                updateDeliveryField("complement", "")
                              }
                              label="Limpar complemento"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.address ? (
                    <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700 sm:text-[15px]">
                      {errors.address}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[10px] border border-zinc-300 bg-white px-4 py-4 text-[15px] text-zinc-600 sm:rounded-[12px] sm:px-5 sm:text-[16px]">
                  Retirada no balcao selecionada. Toque em avancar para seguir.
                </div>
              )}
            </div>
          ) : null}

          {step === "additional" ? (
            <div className="space-y-5 pt-1 sm:space-y-6">
              <div>
                <h2 className="text-[36px] font-semibold leading-tight text-zinc-900 sm:text-[38px]">
                  Envie uma mensagem ao vendedor
                </h2>
                <p className="mt-1 text-[15px] text-zinc-700">
                  Observacao ao vendedor
                </p>
              </div>

              <div>
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value.slice(0, NOTE_MAX))
                  }
                  rows={5}
                  placeholder="Tamanho, cor ou alguma informacao importante para o vendedor."
                  className="w-full resize-none rounded-[10px] border border-zinc-300 bg-white px-4 py-3 text-[18px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-800 sm:rounded-[12px] sm:text-[19px]"
                />
                <div className="mt-2 text-right text-[14px] text-zinc-500 sm:text-[15px]">
                  {notesRemaining} caracteres restantes
                </div>
              </div>
            </div>
          ) : null}

          {step === "identify" ? (
            <div className="space-y-4 pt-1 sm:space-y-5">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                >
                  Nome
                </label>
                <div className="relative">
                  <input
                    id="checkout-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSubmitError(null);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Seu nome"
                    className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                  />
                  {name ? (
                    <ClearButton onClick={() => setName("")} label="Limpar nome" />
                  ) : null}
                </div>
                {errors.name ? (
                  <p className="mt-1 text-[13px] text-red-600 sm:text-[14px]">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="checkout-email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubmitError(null);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    inputMode="email"
                    autoComplete="email"
                    placeholder="seuemail@dominio.com"
                    className="h-14 w-full rounded-[10px] border border-zinc-300 bg-white px-4 pr-12 text-[16px] text-zinc-900 outline-none focus:border-zinc-800 sm:h-[62px] sm:rounded-[12px] sm:px-5 sm:pr-16 sm:text-[17px]"
                  />
                  {email ? (
                    <ClearButton
                      onClick={() => setEmail("")}
                      label="Limpar e-mail"
                    />
                  ) : null}
                </div>
                {errors.email ? (
                  <p className="mt-1 text-[13px] text-red-600 sm:text-[14px]">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="mb-2 block text-[14px] font-medium text-zinc-800 sm:text-[15px]"
                >
                  Celular/Whatsapp
                </label>
                <div className="grid grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-zinc-300 bg-white sm:grid-cols-[100px_minmax(0,1fr)] sm:rounded-[12px]">
                  <div className="relative border-r border-zinc-300">
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      className="h-14 w-full appearance-none bg-transparent px-3 pr-8 text-[16px] text-zinc-900 outline-none sm:h-[62px] sm:px-4 sm:text-[17px]"
                    >
                      <option value="55">55</option>
                      <option value="1">1</option>
                      <option value="351">351</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700 sm:right-3" />
                  </div>

                  <div className="relative">
                    <input
                      id="checkout-phone"
                      value={phoneNumber}
                      onChange={(event) => {
                        setPhoneNumber(normalizePhoneInput(event.target.value));
                        setSubmitError(null);
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      inputMode="numeric"
                      placeholder="98996020952"
                      className="h-14 w-full bg-transparent px-4 pr-12 text-[16px] text-zinc-900 outline-none sm:h-[62px] sm:px-5 sm:pr-16 sm:text-[17px]"
                    />
                    {phoneNumber ? (
                      <ClearButton
                        onClick={() => setPhoneNumber("")}
                        label="Limpar celular"
                      />
                    ) : null}
                  </div>
                </div>
                {errors.phone ? (
                  <p className="mt-1 text-[13px] text-red-600 sm:text-[14px]">
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="mt-0.5 h-6 w-6 rounded-[6px] border border-zinc-500 accent-black"
                />
                <span className="text-[15px] text-zinc-900">
                  Concordo com os termos de{" "}
                  <span className="underline">Politica de Privacidade</span>
                </span>
              </label>
              {errors.terms ? (
                <p className="text-[13px] text-red-600 sm:text-[14px]">
                  {errors.terms}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <footer className="fixed bottom-0 left-1/2 z-20 w-full max-w-[640px] -translate-x-1/2 bg-[#e7e7e7]/98 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-5 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {submitError ? (
            <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 sm:text-[14px]">
              {submitError}
            </div>
          ) : null}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (step === "delivery") {
                  handleAdvanceFromDelivery();
                  return;
                }

                if (step === "additional") {
                  setSubmitError(null);
                  setStep("identify");
                  return;
                }

                void handleSubmit();
              }}
              disabled={actionDisabled}
              className={`relative w-full rounded-full px-5 py-4 pl-20 pr-14 text-white transition sm:px-6 sm:py-5 sm:pl-24 sm:pr-16 ${
                actionDisabled ? "bg-zinc-500" : "bg-black"
              }`}
            >
              <span className="block text-center text-[16px] font-semibold sm:text-[18px]">
                {actionLabel}
              </span>
              <ChevronRight className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 sm:right-6 sm:h-8 sm:w-8" />
            </button>

            <div className="pointer-events-none absolute left-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)] sm:left-4 sm:h-16 sm:w-16">
              <MessageCircle className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
