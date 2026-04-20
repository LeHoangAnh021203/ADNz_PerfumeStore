"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageList } from "./message-list"
import { Composer, AI_MODELS, type AIModel } from "./composer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Data model for messages
export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    createdAt: Date
    imageData?: string
}

interface ChatShellProps {
    variant?: "page" | "widget"
    onClose?: () => void
}

// localStorage key for persisting messages
const STORAGE_KEY = "chat-messages"
const MODEL_STORAGE_KEY = "chat-selected-model"
const CHAT_OVERLOAD_ERROR_MESSAGE =
    "hệ thống hiện tại đang bị quá tải vì có nhiều lượt truy cập đồng thời, bạn hãy thử dùng model khác và tiếp tục câu hỏi nhé!"
const RESET_CHAT_ICON_GIF = "https://img.icons8.com/?size=128&id=41IIpCq65ndW&format=gif&color=f7f7f7"

// Generates a unique ID for messages
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function ChatShell({ variant = "page", onClose }: ChatShellProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [abortController, setAbortController] = useState<AbortController | null>(null)
    const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
    const [isLoaded, setIsLoaded] = useState(false)

    // Load messages from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                const messagesWithDates = parsed.map((msg: Message) => ({
                    ...msg,
                    createdAt: new Date(msg.createdAt),
                }))
                setMessages(messagesWithDates)
            }
            const savedModel = localStorage.getItem(MODEL_STORAGE_KEY) as AIModel | null
            const isValidSavedModel = !!savedModel && AI_MODELS.some((m) => m.id === savedModel)
            if (isValidSavedModel) {
                setSelectedModel(savedModel)
            }
        } catch (e) {
            console.error("Failed to load from localStorage:", e)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (!isLoaded) return

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        } catch (e) {
            console.error("Failed to save messages to localStorage:", e)
        }
    }, [messages, isLoaded])

    const handleModelChange = useCallback((model: AIModel) => {
        setSelectedModel(model)
        setError(null)
        localStorage.setItem(MODEL_STORAGE_KEY, model)
    }, [])

    // Send a message to the AI
    const sendMessage = useCallback(
        async (content: string, imageData?: string) => {
            if ((!content.trim() && !imageData) || isStreaming) return

            setError(null)

            const userMessage: Message = {
                id: generateId(),
                role: "user",
                content: content.trim() || "Describe this image",
                createdAt: new Date(),
                imageData,
            }

            const assistantMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: "",
                createdAt: new Date(),
            }

            const newMessages = [...messages, userMessage, assistantMessage]
            setMessages(newMessages)
            setIsStreaming(true)

            const controller = new AbortController()
            setAbortController(controller)

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages: [...messages, userMessage].map((m) => ({
                            role: m.role,
                            content: m.content,
                            imageData: m.imageData,
                        })),
                        model: selectedModel,
                    }),
                    signal: controller.signal,
                })

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`
                    try {
                        const payload = await response.json()
                        if (payload?.error && typeof payload.error === "string") {
                            errorMessage = payload.error
                        }
                    } catch {
                        // Ignore non-JSON error body
                    }
                    throw new Error(errorMessage)
                }

                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                    throw new Error("No response body")
                }

                let accumulatedContent = ""

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    accumulatedContent += chunk

                    setMessages((prev) =>
                        prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg)),
                    )
                }
            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessage.id ? { ...msg, content: msg.content || "[Cancelled]" } : msg,
                        ),
                    )
                } else {
                    console.error("Error sending message:", e)
                    setError(CHAT_OVERLOAD_ERROR_MESSAGE)
                    setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
                }
            } finally {
                setIsStreaming(false)
                setAbortController(null)
            }
        },
        [messages, isStreaming, selectedModel],
    )

    const retry = useCallback(() => {
        if (messages.length === 0) return
        const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
        if (lastUserMessage) {
            const index = messages.findIndex((m) => m.id === lastUserMessage.id)
            setMessages(messages.slice(0, index))
            setError(null)
            setTimeout(() => sendMessage(lastUserMessage.content, lastUserMessage.imageData), 100)
        }
    }, [messages, sendMessage])

    const stopStreaming = useCallback(() => {
        if (abortController) {
            abortController.abort()
        }
    }, [abortController])

    const clearChat = useCallback(() => {
        setMessages([])
        setError(null)
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    const isWidget = variant === "widget"

    return (
        <div
            className={cn(
                "relative bg-stone-950",
                isWidget ? "h-[min(78vh,720px)] rounded-3xl border border-stone-200 overflow-hidden" : "h-dvh",
            )}
            style={{
                boxShadow:
                    "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
            }}
        >
            <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
            >
                <source src="/video/chat_bg.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

            <Button
                onClick={clearChat}
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
                aria-label="Reset chat"
            >
                <img src={RESET_CHAT_ICON_GIF} alt="Reset chat" className="h-6 w-6 object-contain" />
            </Button>

            {isWidget && onClose ? (
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-20 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
                >
                    Close
                </Button>
            ) : null}

            <MessageList
                messages={messages}
                isStreaming={isStreaming}
                error={error}
                onRetry={retry}
                isLoaded={isLoaded}
                composerLayout="fixed"
            />

            <Composer
                onSend={sendMessage}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                disabled={false}
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                layout={isWidget ? "anchored" : "fixed"}
            />
        </div>
    )
}
