export type SupportedPlatform =
  | "facebook"
  | "threads"
  | "tiktok"
  | "instagram"
  | "x"
  | "telegram"
  | "whatsapp";

export type NormalizedLink = {
  platform: SupportedPlatform;
  normalizedUrl: string;
};

const PLATFORM_HOSTS: Record<SupportedPlatform, string[]> = {
  facebook: ["facebook.com", "fb.com"],
  threads: ["threads.net", "threads.com"],
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com"],
  x: ["x.com", "twitter.com"],
  telegram: ["t.me", "telegram.me"],
  whatsapp: ["wa.me", "whatsapp.com", "api.whatsapp.com", "chat.whatsapp.com", "web.whatsapp.com"],
};

function normalizeHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host.startsWith("www.") ? host.slice(4) : host;
}

function detectPlatform(hostname: string): SupportedPlatform | null {
  const host = normalizeHost(hostname);

  for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS) as Array<[
    SupportedPlatform,
    string[],
  ]>) {
    if (hosts.some((allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`))) {
      return platform;
    }
  }

  return null;
}

export function normalizeAndValidatePhone(rawPhone: string) {
  const cleaned = rawPhone.replace(/[^\d+]/g, "").trim();

  if (!cleaned) {
    return { ok: false as const, error: "Vui lòng nhập số điện thoại Zalo." };
  }

  let national = cleaned;

  if (national.startsWith("+84")) {
    national = national.slice(3);
  } else if (national.startsWith("84")) {
    national = national.slice(2);
  } else if (national.startsWith("0")) {
    national = national.slice(1);
  }

  national = national.replace(/\D/g, "");

  if (!/^[35789]\d{8}$/.test(national)) {
    return {
      ok: false as const,
      error: "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số di động Việt Nam.",
    };
  }

  return {
    ok: true as const,
    local: `0${national}`,
    e164: `+84${national}`,
  };
}

export function normalizeAndValidateEmail(rawEmail: string) {
  const normalized = rawEmail.trim().toLowerCase();

  if (!normalized) {
    return { ok: false as const, error: "Vui lòng nhập email." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { ok: false as const, error: "Email không hợp lệ. Vui lòng kiểm tra lại." };
  }

  return { ok: true as const, value: normalized };
}

function normalizeUrlCandidate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function normalizeAndValidateLinks(rawLinks: string[]) {
  const errors: string[] = [];
  const accepted: NormalizedLink[] = [];
  const seen = new Set<string>();

  rawLinks.forEach((raw, index) => {
    const candidate = normalizeUrlCandidate(raw);
    if (!candidate) return;

    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      errors.push(`Link #${index + 1} không đúng định dạng URL.`);
      return;
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`Link #${index + 1} chỉ chấp nhận http/https.`);
      return;
    }

    const platform = detectPlatform(url.hostname);
    if (!platform) {
      errors.push(
        `Link #${index + 1} không thuộc nền tảng hỗ trợ: Facebook, Threads, TikTok, Instagram, X, Telegram, WhatsApp.`
      );
      return;
    }

    url.hash = "";
    const normalizedUrl = url.toString();
    if (seen.has(normalizedUrl)) return;

    seen.add(normalizedUrl);
    accepted.push({ platform, normalizedUrl });
  });

  return {
    ok: errors.length === 0,
    errors,
    links: accepted,
  };
}
