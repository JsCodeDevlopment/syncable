/**
 * Rich Text Viewer Component
 *
 * Componente de visualização (read-only) do conteúdo do editor.
 * Renderiza o conteúdo exatamente como foi editado, sem permitir edição.
 */

'use client';

import React, { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';

import { Element, Leaf } from './elements';
import { getRichTextContent } from './html-to-slate';
import { RichTextViewerProps } from './types';
import { getDefaultValue, isValidValue, serializeToHtml } from './utils';

/**
 * Componente RichTextViewer
 */
export const RichTextViewer: React.FC<RichTextViewerProps> = ({ content, jsonContent, htmlContent, className }) => {
  // Cria um editor somente leitura
  const editor = useMemo(() => withReact(createEditor()), []);

  // Determina o conteúdo final
  const finalContent = useMemo(() => {
    // Se content foi passado diretamente, usa ele
    if (content && isValidValue(content)) {
      return content;
    }

    // Se jsonContent ou htmlContent foram passados, usa getRichTextContent
    if (jsonContent || htmlContent) {
      return getRichTextContent(jsonContent, htmlContent);
    }

    return getDefaultValue();
  }, [content, jsonContent, htmlContent]);

  // Renderiza elementos
  const renderElement = React.useCallback((props: RenderElementProps) => <Element {...props} />, []);

  // Renderiza folhas (texto formatado)
  const renderLeaf = React.useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  return (
    <div className={cn('rich-text-viewer', className)}>
      <Slate key={JSON.stringify(finalContent)} editor={editor} initialValue={finalContent}>
        <Editable readOnly renderElement={renderElement} renderLeaf={renderLeaf} className="focus:outline-none" />
      </Slate>
    </div>
  );
};

/**
 * Componente para renderizar conteúdo como HTML puro
 */
export const RichTextHtmlViewer: React.FC<RichTextViewerProps> = ({ content, className }) => {
  const html = useMemo(() => {
    if (!isValidValue(content)) return '';
    return serializeToHtml(content);
  }, [content]);

  return <div className={cn('rich-text-html-viewer prose prose-sm max-w-none dark:prose-invert', className)} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default RichTextViewer;
