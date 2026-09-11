import { useId, type ReactNode } from "react"

type BacklightProps = {
  children?: ReactNode
  className?: string
  saturation?: number
  blur?: number
}

export function Backlight({ blur = 20, saturation = 4, children, className }: BacklightProps) {
  const rawId = useId()
  const id = `backlight-${rawId.replace(/:/g, "")}`

  return (
    <div className={`relative ${className ?? ""}`}>
      <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
          <feColorMatrix type="saturate" in="blurred" values={saturation} result="saturated" />
          <feMerge>
            <feMergeNode in="saturated" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
      <div style={{ filter: `url(#${id})` }} className="w-full h-full">
        {children}
      </div>
    </div>
  )
}
