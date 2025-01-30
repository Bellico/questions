'use client'

import { PLUGINS_MDX } from '@/components/mdx/mdx-markdown-plugins'
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  toolbarPlugin,
  type MDXEditorMethods,
  type MDXEditorProps
} from '@mdxeditor/editor'
import type { ForwardedRef } from 'react'

export default function MarkdownEditor({
  ref,
  ...props
}: { ref: ForwardedRef<MDXEditorMethods | null> } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {' '}
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ListsToggle />
              <BlockTypeSelect />
              <CreateLink />
              <InsertTable />
              <InsertThematicBreak />
              <InsertImage />
            </>
          ),
        }),
        ...PLUGINS_MDX]}
      contentEditableClassName="q-editor-markdown"
      ref={ref}
      {...props} />
  )
}
