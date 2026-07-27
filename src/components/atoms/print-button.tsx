"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

type PrintButtonProps = {
  label: string
}

/** Triggers the browser print dialog (Save as PDF). */
export function PrintButton({ label }: PrintButtonProps) {
  return (
    <Button
      type="button"
      className="cursor-pointer rounded-none"
      onClick={() => window.print()}
    >
      <Printer className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
