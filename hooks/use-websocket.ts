"use client"

import { useEffect, useRef, useCallback, useState } from "react"

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error"

interface UseWebSocketOptions {
  url: string | null
  onMessage?: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>("disconnected")

  const onMessageRef = useRef(onMessage)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMessageRef.current = onMessage
    onOpenRef.current = onOpen
    onCloseRef.current = onClose
    onErrorRef.current = onError
  }, [onMessage, onOpen, onClose, onError])

  const connect = useCallback(() => {
    if (!url) return

    try {
      setStatus("connecting")
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus("connected")
        reconnectAttemptsRef.current = 0
        onOpenRef.current?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current?.(data)
        } catch {
          onMessageRef.current?.(event.data)
        }
      }

      ws.onclose = () => {
        setStatus("disconnected")
        wsRef.current = null
        onCloseRef.current?.()

        if (
          reconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1
          reconnectTimerRef.current = setTimeout(connect, reconnectInterval)
        }
      }

      ws.onerror = (event) => {
        setStatus("error")
        onErrorRef.current?.(event)
      }
    } catch {
      setStatus("error")
    }
  }, [url, reconnect, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    reconnectAttemptsRef.current = maxReconnectAttempts
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("disconnected")
  }, [maxReconnectAttempts])

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        typeof data === "string" ? data : JSON.stringify(data)
      )
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { status, sendMessage, disconnect, reconnect: connect }
}
