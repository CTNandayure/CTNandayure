// Standard action row for every form/modal in the system: primary action
// first, Cancelar last — justify-end keeps Cancelar pinned to the right.
export function FormActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-3 pt-2">{children}</div>
}
