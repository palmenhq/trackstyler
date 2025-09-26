export type EditMode = 'multi' | 'single'
export type WithEditMode = { editMode: EditMode }

export const isSingleMode = (mode: EditMode | WithEditMode) =>
  mode === 'single' || (typeof mode === 'object' && mode.editMode === 'single')
export const isMultiMode = (mode: EditMode | WithEditMode) =>
  mode === 'multi' || (typeof mode === 'object' && mode.editMode === 'multi')
