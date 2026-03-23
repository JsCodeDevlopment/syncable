/**
 * Plugins para o Rich Text Editor
 *
 * Este arquivo contém extensões (plugins) para o comportamento padrão do Slate.
 * Inclui tratamento para elementos vazios, links, e correções de teclado.
 */

import { Editor, Transforms, Element as SlateElement, Range } from 'slate';

/**
 * Plugin para tratar elementos que não podem ter conteúdo de texto (void nodes)
 * como imagens, vídeos, divisores.
 */
export const withVoids = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return ['image', 'video', 'divider'].includes(element.type) ? true : isVoid(element);
  };

  return editor;
};

import { ReactEditor } from 'slate-react';

/**
 * Plugin para tratar elementos inline como links.
 */
export const withInlines = (editor: Editor) => {
  const e = editor as Editor & ReactEditor;
  const { insertText, insertData, isInline } = e;

  e.isInline = (element) => ['link'].includes(element.type as any) || isInline(element);

  e.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(e, text);
    } else {
      insertText(text);
    }
  };

  e.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(e, text);
    } else {
      insertData(data);
    }
  };

  return e;
};

/**
 * Plugin para corrigir comportamentos de Backspace e Delete em casos específicos.
 */
export const withBackspaceFix = (editor: Editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Array.from(
        Editor.nodes(editor, {
          match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-cell',
        }),
      );

      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Range.isCollapsed(selection) && Range.equals(selection, Editor.range(editor, start))) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

/**
 * Verifica se uma string é uma URL válida
 */
const isUrl = (string: string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_e) {
    return false;
  }
};

/**
 * Envolve a seleção com um link (usado pelo plugin withInlines)
 */
const wrapLink = (editor: Editor, url: string) => {
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  const link = {
    type: 'link' as const,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};
