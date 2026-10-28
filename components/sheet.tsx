'use client'

import { Drawer } from 'vaul'

/** Phone bottom sheet. Import with next/dynamic to keep Vaul out of the first load. */
export default function Sheet({ open, onOpenChange, title, done, className, children }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; done: string; className?: string; children: React.ReactNode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-backdrop" />
        <Drawer.Content className={`sheet ${className ?? ''}`} aria-describedby={undefined}>
          <Drawer.Handle className="sheet-handle" />
          <div className="sheet-head">
            <Drawer.Title className="sheet-title">{title}</Drawer.Title>
            <button className="btn btn-ghost btn-small sheet-done" onClick={() => onOpenChange(false)}>{done}</button>
          </div>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
