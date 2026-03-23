/**
 * Rich Text Editor Component
 *
 * Componente principal do editor de texto rico.
 * Fornece funcionalidades completas de edição de texto, formatação,
 * inserção de mídia e muito mais.
 */

'use client';

import React, { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';

import { Element, Leaf } from './elements';
import { withVoids, withInlines, withBackspaceFix } from './plugins';
import { Toolbar } from './toolbar';
import { RichTextEditorProps } from './types';
import { getDefaultValue, isValidValue } from './utils';

/**
 * Componente RichTextEditor
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  name,
  value: controlledValue,
  initialValue,
  mode = 'uncontrolled',
  readOnly = false,
  placeholder = 'Digite seu texto aqui...',
  minHeight = '200px',
  maxHeight = 'none',
  showToolbar = true,
  autoFocus = false,
  onChange,
  onBlur,
  onFocus,
  className,
  enableImageUpload = false, // Default false for syncable as we don't have a file service yet
  enableVideoUpload = false,
  onImageUpload,
  onVideoUpload,
  enableTable = true,
  enableDivider = true,
  resetKey,
}) => {
  const editor = useMemo(() => withBackspaceFix(withInlines(withVoids(withHistory(withReact(createEditor()))))), [resetKey]);

  // Compute the initial value for Slate — this is only read on mount.
  const computedInitialValue = useMemo<Descendant[]>(() => {
    if (mode === 'controlled' && controlledValue && isValidValue(controlledValue)) {
      return controlledValue;
    }
    if (initialValue && isValidValue(initialValue)) {
      return initialValue;
    }
    return getDefaultValue();
  }, [resetKey]);

  // Handler para mudanças de valor
  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  // Renderiza elementos
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);

  // Renderiza folhas (texto formatado)
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  // Handler para teclas de atalho
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { ctrlKey, key } = event;

      // Atalhos de teclado
      if (ctrlKey) {
        switch (key) {
          case 'b':
            event.preventDefault();
            editor.addMark('bold', true);
            break;
          case 'i':
            event.preventDefault();
            editor.addMark('italic', true);
            break;
          case 'u':
            event.preventDefault();
            editor.addMark('underline', true);
            break;
          case '`':
            event.preventDefault();
            editor.addMark('code', true);
            break;
        }
      }
    },
    [editor],
  );

  return (
    <div id={id} className={cn('rich-text-editor bg-background relative isolate rounded-lg border', className)}>
      <Slate editor={editor} initialValue={computedInitialValue} onChange={handleChange}>
        <div
          className="overflow-auto"
          style={{
            minHeight,
            maxHeight: maxHeight !== 'none' ? maxHeight : '70vh',
          }}
        >
          {showToolbar && !readOnly && (
            <Toolbar
              onImageUpload={onImageUpload}
              onVideoUpload={onVideoUpload}
              enableImageUpload={enableImageUpload}
              enableVideoUpload={enableVideoUpload}
              enableTable={enableTable}
              enableDivider={enableDivider}
            />
          )}

          <div className="p-4">
            <Editable
              id={name}
              readOnly={readOnly}
              placeholder={placeholder}
              autoFocus={autoFocus}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={handleKeyDown}
              onBlur={onBlur}
              onFocus={onFocus}
              className="focus:outline-none"
              spellCheck
            />
          </div>
        </div>
      </Slate>
    </div>
  );
};

export default RichTextEditor;
