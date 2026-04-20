import type { ObjectId } from "mongodb"
import { getMongoDb } from "@/lib/mongodb"
import type { Perfume } from "@/types/perfume"

type ClientMessage = {
  role: "user" | "assistant"
  content: string
  imageData?: string
}

type ProviderMessage = {
  role: "system" | "user" | "assistant"
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >
}

type Provider = "openai" | "openrouter"
type PerfumeDocument = Omit<Perfume, "_id"> & { _id: ObjectId }
const OPENROUTER_MIRRORED_MODELS = new Set<string>([
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
])

const ASSISTANT_POLICY = `You are ADNz.AI, the official AI assistant of ADNz Perfume.

Identity and tone:
- Introduce yourself as an internal ADNz AI assistant.
- If asked "you are who / built by who / developed how", answer that you are an AI system built and operated by ADNz to support perfume consulting and customer care.
- Do not mention backend provider names unless the user explicitly asks technical implementation details.

Consulting scope:
- Perfume recommendations must prioritize ADNz catalog data provided in context.
- Do not invent products, prices, stock, promotions, or policy details.
- If a requested product is not in ADNz catalog context, clearly say ADNz currently has no matching record and suggest close alternatives from available data.
- If user asks for price/stock but data is missing, state that exact info is unavailable and direct user to ADNz contact.

Business context:
- ADNz supports retail/wholesale perfume consulting.
- Quick contact: Zalo 0342 988 398.

Response style:
- Default language: Vietnamese.
- Clear, concise, practical.`

const ADNZ_BUSINESS_CONTEXT = `Verified ADNz contact and social channels:
- Hotline / Zalo: 0342 988 398
- Facebook: ADNzPerfume (https://www.facebook.com/profile.php?id=61573770329166)
- Instagram: @adnz.perfume (https://www.instagram.com/adnz.perfume/)
- TikTok: @tim.nc.bng (https://www.tiktok.com/@tim.nc.bng)
- Threads: @adnz.perfume (https://www.threads.com/@adnz.perfume)

When users ask for ADNz social/contact info, return these channels directly.`

const SCOPE_KEYWORDS = [
  "adnz",
  "nước hoa",
  "nuoc hoa",
  "perfume",
  "fragrance",
  "mùi",
  "mui",
  "hương",
  "huong",
  "note",
  "top note",
  "middle note",
  "base note",
  "xịt",
  "xit",
  "độ lưu hương",
  "luu huong",
  "toả hương",
  "toa huong",
  "tester",
  "refill",
  "showcase",
  "fullseal",
  "mini",
  "set",
  "brand",
  "chanel",
  "dior",
  "guerlain",
  "ysl",
  "tom ford",
  "creed",
  "jo malone",
  "lancome",
  "giá",
  "gia",
  "báo giá",
  "bao gia",
  "còn hàng",
  "con hang",
  "inbox",
  "zalo",
  "sỉ",
  "si",
  "lẻ",
  "le",
  "ctv",
  "wholesale",
  "reseller",
]

const IDENTITY_KEYWORDS = [
  "bạn là ai",
  "ban la ai",
  "ai tạo",
  "ai tao",
  "phát triển",
  "phat trien",
  "được làm từ",
  "duoc lam tu",
  "hệ thống",
  "he thong",
  "adnz.ai",
]

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getLastUserMessage(messages: ClientMessage[]): ClientMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i]
  }
  return undefined
}

function isInAdnzScope(lastUserMessage?: ClientMessage): boolean {
  if (!lastUserMessage) return true
  if (lastUserMessage.imageData && lastUserMessage.imageData.startsWith("data:image/")) return true

  const normalized = normalizeText(lastUserMessage.content || "")
  if (!normalized) return true

  return [...SCOPE_KEYWORDS, ...IDENTITY_KEYWORDS].some((keyword) => normalized.includes(normalizeText(keyword)))
}

function buildOutOfScopeReply(): string {
  return [
    "Mình là ADNz.AI và hiện chỉ hỗ trợ trong phạm vi ADNz Perfume.",
    "Mình có thể tư vấn mùi hương, sản phẩm đang có trong catalog ADNz, và thông tin mua sỉ/lẻ.",
    "Bạn gửi giúp mình nhu cầu nước hoa (brand, nhóm mùi, ngân sách, mục đích dùng), mình tư vấn ngay.",
    "Liên hệ nhanh: Zalo 0342 988 398.",
  ].join("\n")
}

function compact(value: string | null | undefined): string {
  const v = (value || "").trim()
  return v.length > 0 ? v : "N/A"
}

function buildCatalogContext(perfumes: PerfumeDocument[]): string {
  if (perfumes.length === 0) {
    return "Catalog context: No active ADNz perfume records available right now."
  }

  const brands = Array.from(new Set(perfumes.map((p) => compact(p.brand)))).sort((a, b) => a.localeCompare(b))
  const categories = Array.from(new Set(perfumes.map((p) => compact(p.category)))).sort((a, b) => a.localeCompare(b))
  const families = Array.from(new Set(perfumes.map((p) => compact(p.olfactive_family)))).sort((a, b) => a.localeCompare(b))

  const sampleItems = perfumes.slice(0, 120).map((p) => {
    const topNotes = (p.top_notes || []).slice(0, 3).join(", ") || "N/A"
    const keyNotes = (p.key_notes || []).slice(0, 3).join(", ") || "N/A"
    return `- ${compact(p.full_name)} | brand=${compact(p.brand)} | category=${compact(p.category)} | gender=${compact(p.gender)} | concentration=${compact(p.concentration)} | family=${compact(p.olfactive_family)} | key_notes=${keyNotes} | top_notes=${topNotes}`
  })

  return [
    `Catalog context (ADNz active perfumes):`,
    `- Total active items: ${perfumes.length}`,
    `- Brands: ${brands.join(", ")}`,
    `- Categories: ${categories.join(", ")}`,
    `- Olfactive families: ${families.join(", ")}`,
    `- Product records (sample up to 120):`,
    ...sampleItems,
  ].join("\n")
}

async function getSystemMessage(): Promise<ProviderMessage> {
  try {
    const db = await getMongoDb()
    const perfumes = await db
      .collection<PerfumeDocument>("ADNz_perfume")
      .find({ is_active: true })
      .sort({ brand: 1, fragrance_name: 1 })
      .toArray()

    return {
      role: "system",
      content: `${ASSISTANT_POLICY}\n\n${ADNZ_BUSINESS_CONTEXT}\n\n${buildCatalogContext(perfumes)}`,
    }
  } catch (error) {
    console.error("Failed to build catalog context for chat", error)
    return {
      role: "system",
      content: `${ASSISTANT_POLICY}\n\n${ADNZ_BUSINESS_CONTEXT}\n\nCatalog context: unavailable (database fetch failed). If catalog detail is missing, answer conservatively and ask user to confirm with ADNz directly.`,
    }
  }
}

function toProviderMessages(messages: ClientMessage[]): ProviderMessage[] {
  const lastIndex = messages.length - 1

  const mapped = messages.map<ProviderMessage | null>((m, index) => {
    const isLastUserMessage = index === lastIndex && m.role === "user"

    if (isLastUserMessage && m.imageData && m.imageData.startsWith("data:image/")) {
      return {
        role: "user",
        content: [
          { type: "text", text: m.content || "Describe this image." },
          { type: "image_url", image_url: { url: m.imageData } },
        ],
      }
    }

    const textContent = (m.content || "").trim()
    if (!textContent) return null

    return {
      role: m.role,
      content: textContent,
    }
  })

  return mapped.filter((m): m is ProviderMessage => m !== null)
}

function resolveTarget(rawModel?: string): { provider: Provider; model: string } {
  const model = typeof rawModel === "string" ? rawModel.trim() : ""

  if (OPENROUTER_MIRRORED_MODELS.has(model)) {
    return { provider: "openrouter", model }
  }

  if (model.startsWith("openai/")) {
    return { provider: "openai", model: model.replace(/^openai\//, "") }
  }
  if (model.startsWith("openrouter/")) {
    return { provider: "openrouter", model }
  }
  if (model.startsWith("google/") || model.startsWith("anthropic/")) {
    return { provider: "openrouter", model }
  }

  // Backward compatibility with older stored values
  if (model === "gpt-4o" || model === "gpt-4o-mini") {
    return { provider: "openai", model }
  }

  return { provider: "openai", model: "gpt-4o-mini" }
}

async function callOpenAI(apiKey: string, model: string, messages: ProviderMessage[]) {
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!upstream.ok) {
    const errorText = await upstream.text()
    return new Response(JSON.stringify({ error: `OpenAI error ${upstream.status}: ${errorText}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const payload = (await upstream.json()) as {
    choices?: Array<{
      message?: { content?: string | Array<{ type?: string; text?: string }> }
    }>
  }

  const content = payload.choices?.[0]?.message?.content
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .filter((part) => part?.type === "text" && typeof part.text === "string")
            .map((part) => part.text)
            .join("\n")
        : ""

  return new Response(text || "", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

async function callOpenRouter(apiKey: string, model: string, messages: ProviderMessage[]) {
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!upstream.ok) {
    const errorText = await upstream.text()
    return new Response(JSON.stringify({ error: `OpenRouter error ${upstream.status}: ${errorText}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  const payload = (await upstream.json()) as {
    choices?: Array<{
      message?: { content?: string | Array<{ type?: string; text?: string }> }
    }>
  }

  const content = payload.choices?.[0]?.message?.content
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .filter((part) => part?.type === "text" && typeof part.text === "string")
            .map((part) => part.text)
            .join("\n")
        : ""

  return new Response(text || "", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

export async function POST(req: Request) {
  try {
    const { messages, model } = (await req.json()) as {
      messages?: ClientMessage[]
      model?: string
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lastUserMessage = getLastUserMessage(messages)
    if (!isInAdnzScope(lastUserMessage)) {
      return new Response(buildOutOfScopeReply(), {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    const transformedMessages = toProviderMessages(messages)
    if (transformedMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages to process" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemMessage = await getSystemMessage()
    const providerMessages: ProviderMessage[] = [systemMessage, ...transformedMessages]

    const target = resolveTarget(model)

    if (target.provider === "openai") {
      const openAIApiKey = process.env.OPENAI_API_KEY
      if (!openAIApiKey) {
        return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY in FE/.env.local" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
      return callOpenAI(openAIApiKey, target.model, providerMessages)
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENROUTER_API_KEY in FE/.env.local for OpenRouter-routed models (Gemini/Claude/GPT)",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
    return callOpenRouter(openRouterApiKey, target.model, providerMessages)
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
