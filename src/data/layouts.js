export const CARD_LAYOUTS = [
  { id: 'postcard', name: '明信片', shortName: '片' },
  { id: 'shujian', name: '书笺', shortName: '笺' },
  { id: 'ticket', name: '票券', shortName: '票' },
]

export function defaultCardLayout() {
  return 'postcard'
}

export function getCardLayoutName(id) {
  return CARD_LAYOUTS.find((layout) => layout.id === id)?.name || '诗笺'
}
