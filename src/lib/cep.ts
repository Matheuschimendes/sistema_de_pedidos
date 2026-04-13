export type CepAddress = {
  zip: string;
  street: string;
  district: string;
  city: string;
  stateCode: string;
  complement: string;
};

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export async function fetchAddressByCep(rawCep: string): Promise<CepAddress> {
  const cep = normalizeCep(rawCep);

  if (cep.length !== 8) {
    throw new Error("CEP invalido");
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar CEP");
  }

  const data = (await response.json()) as {
    erro?: boolean;
    cep?: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    complemento?: string;
  };

  if (data.erro || !data.uf || !data.localidade) {
    throw new Error("CEP nao encontrado");
  }

  return {
    zip: normalizeCep(data.cep ?? cep),
    street: data.logradouro?.trim() ?? "",
    district: data.bairro?.trim() ?? "",
    city: data.localidade.trim(),
    stateCode: data.uf.trim().toUpperCase(),
    complement: data.complemento?.trim() ?? "",
  };
}
