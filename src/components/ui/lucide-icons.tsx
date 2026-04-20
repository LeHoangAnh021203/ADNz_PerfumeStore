import * as React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>

const baseProps: IconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const createIcon = (
  displayName: string,
  children: React.ReactNode,
  viewBox = '0 0 24 24',
) => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <svg ref={ref} viewBox={viewBox} {...baseProps} {...props}>
      {children}
    </svg>
  ))

  Component.displayName = displayName
  return Component
}

export const ArrowLeft = createIcon(
  'ArrowLeft',
  <path d="M15 5 9 12l6 7" />,
)

export const ArrowRight = createIcon(
  'ArrowRight',
  <path d="M9 5 15 12 9 19" />,
)

const ChevronRightBase = createIcon('ChevronRight', <path d="M9 6 15 12 9 18" />)
export const ChevronRight = ChevronRightBase
export const ChevronRightIcon = ChevronRightBase

export const ChevronLeftIcon = createIcon(
  'ChevronLeftIcon',
  <path d="M15 6 9 12 15 18" />,
)

export const ChevronDownIcon = createIcon(
  'ChevronDownIcon',
  <path d="M6 10 12 16 18 10" />,
)

export const ChevronUpIcon = createIcon(
  'ChevronUpIcon',
  <path d="M6 14 12 8 18 14" />,
)

export const CircleIcon = createIcon(
  'CircleIcon',
  <circle cx="12" cy="12" r="6" />,
)

export const User = createIcon(
  'User',
  <>
    <circle cx="12" cy="8" r="3" />
    <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" />
  </>,
)
export const UserIcon = User

export const CheckIcon = createIcon(
  'CheckIcon',
  <path d="M5 12l4 4 10-11" />,
)
export const Check = CheckIcon

export const Sparkles = createIcon(
  'Sparkles',
  <>
    <path d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3z" />
    <path d="M5 14l.8 2 .2.8.8.2L9 18l-2.2.8-.8 2.2-.8-2.2L3 18l2.2-.8L6 15l-.8-1z" />
    <path d="M18.5 14.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" />
  </>,
)

export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="6" />
    <line x1="16" y1="16" x2="21" y2="21" />
  </>,
)

export const ShoppingCart = createIcon(
  'ShoppingCart',
  <>
    <circle cx="7" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
    <path d="M3 6h2l1 7h12l1.5-6H5" />
    <path d="M6 6 6 4h12" />
  </>,
)

export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v2" />
    <path d="M12 12h-0.01" />
    <path d="M12 14v4" />
  </>,
)
export const Info = InfoIcon

export const MessageSquareDashed = createIcon(
  'MessageSquareDashed',
  <>
    <path d="M16 8H8l-1 10h11l1-6" />
    <path d="M8 6h8M8 3h8M8 12h4" />
  </>,
)

const CirclePlusBase = createIcon(
  'CirclePlus',
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </>,
)
export const CirclePlus = CirclePlusBase
export const CirclePlusIcon = CirclePlusBase

export const GripVerticalIcon = createIcon(
  'GripVerticalIcon',
  <>
    <line x1="12" y1="5" x2="12" y2="7" />
    <line x1="12" y1="11" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="19" />
  </>,
)

export const PanelLeftIcon = createIcon(
  'PanelLeftIcon',
  <>
    <rect x="4" y="5" width="6" height="14" rx="2" />
    <path d="M14 8 19 12 14 16" />
  </>,
)

export const Square = createIcon(
  'Square',
  <rect x="5" y="5" width="14" height="14" rx="3" />,
)

export const Mic = createIcon(
  'Mic',
  <>
    <rect x="10" y="5" width="4" height="10" rx="2" />
    <path d="M8 9h8" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
    <path d="M7 10v2a5 5 0 0 0 10 0v-2" />
  </>,
)

export const MicOff = createIcon(
  'MicOff',
  <>
    <path d="M8 10.5v.5a5 5 0 0 0 10 0v-.5" />
    <path d="M12 17v4" />
    <path d="M6 6l12 12" />
    <path d="M11.5 6H12a5 5 0 0 1 5 5v3" />
  </>,
)

export const Brain = createIcon(
  'Brain',
  <>
    <path d="M9 6h6" />
    <path d="M10 4h4" />
    <path d="M6 10h1" />
    <path d="M17 10h1" />
    <path d="M12 6v12" />
    <path d="M8 16s-2 1-2 3 1 3 4 3h4c3 0 4-1.5 4-4s-2-3-2-3" />
  </>,
)

export const Paperclip = createIcon(
  'Paperclip',
  <>
    <path d="M7 12v-3a3 3 0 0 1 6 0v6a4 4 0 0 1-8 0v-4a3 3 0 0 1 6 0v3" />
    <path d="M10 5 6 9l4 4" />
  </>,
)

export const AlertCircle = createIcon(
  'AlertCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5" />
    <path d="M12 16h.01" />
  </>,
)

export const RefreshCw = createIcon(
  'RefreshCw',
  <>
    <path d="M4 4v6h6" />
    <path d="M20 20v-6h-6" />
    <path d="M5.5 9a7 7 0 1 1 13 0" />
  </>,
)

export const Loader2Icon = createIcon(
  'Loader2Icon',
  <>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4 12H2" />
    <path d="M22 12h-2" />
    <path d="M5.6 5.6 3.5 3.5" />
    <path d="M18.4 18.4 20.5 20.5" />
  </>,
)
export const Loader2 = Loader2Icon

export const ExternalLinkIcon = createIcon(
  'ExternalLinkIcon',
  <>
    <path d="M14 5h5v5" />
    <path d="M10 14 19 5" />
    <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
  </>,
)
export const ExternalLink = ExternalLinkIcon

export const MinusIcon = createIcon('MinusIcon', <path d="M7 12h10" />)

const MoreHorizontalBase = createIcon(
  'MoreHorizontal',
  <>
    <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
  </>,
)
export const MoreHorizontal = MoreHorizontalBase
export const MoreHorizontalIcon = MoreHorizontalBase

export const XIcon = createIcon(
  'XIcon',
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </>,
)
export const X = XIcon

export const MoreVertical = createIcon(
  'MoreVertical',
  <>
    <circle cx="12" cy="6" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
  </>,
)

export const Pencil = createIcon(
  'Pencil',
  <>
    <path d="M3 21h4.5L19 9.5 14.5 5 3 16.5V21z" />
    <path d="M13.5 6 18 10.5" />
  </>,
)

export const Trash2 = createIcon(
  'Trash2',
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </>,
)

export const Heart = createIcon(
  'Heart',
  <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />,
)
