'use client'

import { PLUGINS_MDX } from '@/components/mdx/mdx-markdown-plugins'
import {
  MDXEditor, MDXEditorMethods
} from '@mdxeditor/editor'
import { RefObject } from 'react'

export default function MarkdownReader({
  ref,
  markdown
}: { ref?: RefObject<MDXEditorMethods | null> } & { markdown : string}) {
  return (
    <MDXEditor
      ref={ref}
      markdown={markdown}
      readOnly={true}
      contentEditableClassName="q-editor-markdown"
      plugins={PLUGINS_MDX}
    />
  )
}

