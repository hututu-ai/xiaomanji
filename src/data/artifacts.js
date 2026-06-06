export const ARTIFACT_LAYOUTS = [
  { id: 'shujian', name: '书笺', shortName: '笺' },
  { id: 'postcard', name: '明信片', shortName: '片' },
  { id: 'ticket', name: '票券', shortName: '票' },
]

export function defaultArtifactLayout(poem) {
  return poem?.form && /词|曲/.test(poem.form) ? 'shujian' : 'postcard'
}

export function getArtifactName(id) {
  return ARTIFACT_LAYOUTS.find((layout) => layout.id === id)?.name || '成品'
}
