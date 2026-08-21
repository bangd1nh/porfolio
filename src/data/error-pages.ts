import type { Locale } from "@/i18n/routing"

export type ErrorPageCode = "404" | "500"

export type ErrorPageCopy = {
  eyebrow: string
  title: string
  description: string
  status: string
  home: string
  back: string
  retry: string
  reference: string
  terminal: readonly string[]
}

export const errorPageCopy = {
  en: {
    "404": {
      eyebrow: "Route resolver",
      title: "This page slipped off the grid.",
      description:
        "The address may have moved, changed, or never made it into this build.",
      status: "NOT_FOUND",
      home: "Back home",
      back: "Go back",
      retry: "Try again",
      reference: "Reference",
      terminal: [
        "GET /requested-route",
        "resolver.scan() → no match",
        "fallback.status → 404",
      ],
    },
    "500": {
      eyebrow: "Runtime monitor",
      title: "The system hit an unexpected fault.",
      description:
        "A process stopped before the page could finish. Retry the request or return to a stable route.",
      status: "SYSTEM_FAULT",
      home: "Back home",
      back: "Go back",
      retry: "Retry process",
      reference: "Reference",
      terminal: [
        "runtime.health → interrupted",
        "boundary.capture() → success",
        "recovery.status → standing by",
      ],
    },
  },
  vi: {
    "404": {
      eyebrow: "Bộ phân giải route",
      title: "Trang này đã trượt khỏi hệ lưới.",
      description:
        "Địa chỉ có thể đã được di chuyển, thay đổi hoặc chưa từng tồn tại trong bản build này.",
      status: "KHÔNG_TÌM_THẤY",
      home: "Về trang chủ",
      back: "Quay lại",
      retry: "Thử lại",
      reference: "Mã tham chiếu",
      terminal: [
        "GET /duong-dan-yeu-cau",
        "resolver.scan() → không khớp",
        "fallback.status → 404",
      ],
    },
    "500": {
      eyebrow: "Giám sát runtime",
      title: "Hệ thống gặp một sự cố ngoài dự kiến.",
      description:
        "Một tiến trình đã dừng trước khi trang hoàn tất. Hãy thử lại hoặc quay về route ổn định.",
      status: "LỖI_HỆ_THỐNG",
      home: "Về trang chủ",
      back: "Quay lại",
      retry: "Chạy lại tiến trình",
      reference: "Mã tham chiếu",
      terminal: [
        "runtime.health → gián đoạn",
        "boundary.capture() → thành công",
        "recovery.status → đang chờ",
      ],
    },
  },
} as const satisfies Record<
  Locale,
  Record<ErrorPageCode, ErrorPageCopy>
>
