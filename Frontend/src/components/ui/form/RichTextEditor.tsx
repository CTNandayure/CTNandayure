import { useEffect } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { cn } from '../../../lib/cn'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

// Minimal rich text editor — bold, links, and lists only, matching the scope
// requested for news content. Extend the StarterKit config here if more marks
// are ever needed, and update Backend/src/news/utils/sanitize-content.ts to
// allow the corresponding tags, since stored HTML is sanitized against an
// explicit allowlist that currently mirrors exactly what this editor can produce.
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        italic: false,
        strike: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[200px] px-4 py-3 text-sm leading-relaxed text-brand-ink focus:outline-none',
          '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1',
          '[&_a]:text-brand-green [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0',
        ),
      },
    },
  })

  // Keep the editor in sync when the form resets from freshly-loaded data
  // (see InstitutionalInfoAdminPage's identical reset() pattern) without
  // fighting the cursor on every keystroke the editor itself produced.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-lg border border-brand-navy/15 bg-white focus-within:border-brand-navy/40">
      <div className="flex items-center gap-1 border-b border-brand-navy/10 bg-brand-paper px-2 py-1.5">
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Negrita">
          <strong className="text-[13px] leading-none">B</strong>
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Lista con viñetas">
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Lista numerada">
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('link')} onClick={() => setLink(editor)} label="Enlace">
          <LinkIcon />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function setLink(editor: Editor) {
  const previousUrl = (editor.getAttributes('link').href as string | undefined) ?? ''
  const url = window.prompt('URL del enlace', previousUrl || 'https://')
  if (url === null) return
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-brand-navy text-white' : 'text-brand-navy/70 hover:bg-brand-navy/10',
      )}
    >
      {children}
    </button>
  )
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <circle cx="2.5" cy="4" r="1.4" />
      <circle cx="2.5" cy="10" r="1.4" />
      <circle cx="2.5" cy="16" r="1.4" />
      <rect x="6.5" y="3" width="12" height="2" rx="1" />
      <rect x="6.5" y="9" width="12" height="2" rx="1" />
      <rect x="6.5" y="15" width="12" height="2" rx="1" />
    </svg>
  )
}

function OrderedListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <text x="0" y="5.5" fontSize="5" fontWeight="700">1</text>
      <text x="0" y="11.5" fontSize="5" fontWeight="700">2</text>
      <text x="0" y="17.5" fontSize="5" fontWeight="700">3</text>
      <rect x="6.5" y="3" width="12" height="2" rx="1" />
      <rect x="6.5" y="9" width="12" height="2" rx="1" />
      <rect x="6.5" y="15" width="12" height="2" rx="1" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M10.5 6H8a4 4 0 000 8h2.5M13.5 18H16a4 4 0 000-8h-2.5" />
    </svg>
  )
}
