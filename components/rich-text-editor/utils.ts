/**
 * Utilitários para o Rich Text Editor
 *
 * Este arquivo contém funções auxiliares para manipulação do editor,
 * formatação de texto, e outras operações comuns.
 */

import { Editor, Element as SlateElement, Transforms, Text, Range, Descendant } from 'slate';

import { CustomElement, TextFormat, ElementType, TextAlign, LinkElement, ImageElement, VideoElement, TableCellElement } from './types';

/**
 * Verifica se um formato de marca está ativo no editor
 */
export const isMarkActive = (editor: Editor, format: TextFormat): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

/**
 * Alterna um formato de marca no editor
 */
export const toggleMark = (editor: Editor, format: TextFormat): void => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

/**
 * Verifica se um tipo de bloco está ativo no editor
 */
export const isBlockActive = (editor: Editor, type: ElementType, blockType: 'type' | 'align' = 'type'): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === type,
    }),
  );

  return !!match;
};

/**
 * Verifica se um alinhamento está ativo no editor
 */
export const isAlignActive = (editor: Editor, align: TextAlign): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === align,
    }),
  );

  return !!match;
};

/**
 * Alterna um tipo de bloco no editor
 */
export const toggleBlock = (editor: Editor, type: ElementType): void => {
  const isActive = isBlockActive(editor, type);
  const isList = ['bulleted-list', 'numbered-list'].includes(type);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
    split: true,
  });

  let newProperties: Partial<CustomElement>;

  if (isActive && type !== 'paragraph') {
    newProperties = { type: 'paragraph' };
  } else if (isList) {
    newProperties = { type: 'list-item' };
  } else {
    newProperties = { type };
  }

  Transforms.setNodes<CustomElement>(editor, newProperties);

  if (!isActive && isList) {
    const block: CustomElement = { type: type as ElementType, children: [] } as CustomElement;
    Transforms.wrapNodes<CustomElement>(editor, block);
  }
};

/**
 * Altera o alinhamento de um bloco
 */
export const toggleAlign = (editor: Editor, align: TextAlign): void => {
  const isActive = isBlockActive(editor, align as ElementType, 'align');

  Transforms.setNodes(editor, { align: isActive ? undefined : align }, { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) });
};

/**
 * Insere um link no editor
 */
export const insertLink = (editor: Editor, url: string, text?: string): void => {
  if (editor.selection) {
    wrapLink(editor, url, text);
  }
};

/**
 * Envolve a seleção atual com um link
 */
export const wrapLink = (editor: Editor, url: string, text?: string): void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  const link: CustomElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

/**
 * Remove um link da seleção atual
 */
export const unwrapLink = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};

/**
 * Verifica se há um link ativo na seleção
 */
export const isLinkActive = (editor: Editor): boolean => {
  const [link] = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    }),
  );
  return !!link;
};

/**
 * Insere uma imagem no editor
 */
export const insertImage = (editor: Editor, url: string, alt?: string): void => {
  const image: CustomElement = {
    type: 'image',
    url,
    alt,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  });
};

/**
 * Insere um vídeo no editor
 */
export const insertVideo = (editor: Editor, url: string): void => {
  const video: CustomElement = {
    type: 'video',
    url,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, video);
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  });
};

/**
 * Insere um divisor horizontal no editor
 */
export const insertDivider = (editor: Editor): void => {
  const divider: CustomElement = {
    type: 'divider',
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, divider);
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  });
};

/**
 * Insere uma tabela no editor
 */
export const insertTable = (editor: Editor, rows: number = 3, cols: number = 3): void => {
  const tableRows: CustomElement[] = Array.from({ length: rows }, () => ({
    type: 'table-row',
    children: Array.from({ length: cols }, () => ({
      type: 'table-cell',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    })),
  }));

  const table: CustomElement = {
    type: 'table',
    children: tableRows,
  };

  Transforms.insertNodes(editor, table);
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  });
};

/**
 * Aplica cor ao texto selecionado
 */
export const setTextColor = (editor: Editor, color: string): void => {
  Editor.addMark(editor, 'color', color);
};

/**
 * Aplica cor de fundo ao texto selecionado
 */
export const setBackgroundColor = (editor: Editor, color: string): void => {
  Editor.addMark(editor, 'backgroundColor', color);
};

/**
 * Aplica tamanho de fonte ao texto selecionado
 */
export const setFontSize = (editor: Editor, size: string): void => {
  Editor.addMark(editor, 'fontSize', size);
};

/**
 * Serializa o conteúdo do editor para HTML
 */
export const serializeToHtml = (nodes: Descendant[] | undefined): string => {
  if (!nodes || !Array.isArray(nodes)) return '';
  return nodes.map((n) => serialize(n as CustomElement)).join('');
};

/**
 * Serializa o conteúdo do editor para texto simples
 */
export const serializeToText = (nodes: Descendant[] | undefined): string => {
  if (!nodes || !Array.isArray(nodes)) return '';
  return nodes.map((n) => nodeToText(n as Descendant)).join('');
};

/**
 * Converte um nó para texto simples
 */
const nodeToText = (node: Descendant): string => {
  if (Text.isText(node)) {
    return node.text;
  }

  if (SlateElement.isElement(node) && node.children) {
    return node.children.map((n: Descendant) => nodeToText(n)).join('');
  }

  return '';
};

/**
 * Serializa um nó para HTML
 */
const serialize = (node: Descendant): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);

    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    if (node.strikethrough) {
      string = `<s>${string}</s>`;
    }
    if (node.code) {
      string = `<code>${string}</code>`;
    }
    if (node.subscript) {
      string = `<sub>${string}</sub>`;
    }
    if (node.superscript) {
      string = `<sup>${string}</sup>`;
    }
    if (node.color) {
      string = `<span style="color: ${node.color}">${string}</span>`;
    }
    if (node.backgroundColor) {
      string = `<span style="background-color: ${node.backgroundColor}">${string}</span>`;
    }
    if (node.fontSize) {
      string = `<span style="font-size: ${node.fontSize}">${string}</span>`;
    }

    return string;
  }

  const children = (node as CustomElement).children.map((n) => serialize(n)).join('');

  switch ((node as CustomElement).type) {
    case 'paragraph':
      return `<p ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</p>`;
    case 'heading-one':
      return `<h1 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h1>`;
    case 'heading-two':
      return `<h2 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h2>`;
    case 'heading-three':
      return `<h3 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h3>`;
    case 'heading-four':
      return `<h4 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h4>`;
    case 'heading-five':
      return `<h5 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h5>`;
    case 'heading-six':
      return `<h6 ${(node as CustomElement).align ? `style="text-align: ${(node as CustomElement).align}"` : ''}>${children}</h6>`;
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'code-block':
      return `<pre><code>${children}</code></pre>`;
    case 'link': {
      const linkNode = node as LinkElement;
      return `<a href="${escapeHtml(linkNode.url)}" ${linkNode.target ? `target="${linkNode.target}"` : ''}>${children}</a>`;
    }
    case 'image': {
      const imgNode = node as ImageElement;
      const widthAttr = imgNode.width ? `width="${imgNode.width}"` : '';
      const heightAttr = imgNode.height ? `height="${imgNode.height}"` : '';
      const alignAttr = imgNode.align ? `align="${imgNode.align}"` : '';
      const styleParts: string[] = [];
      if (imgNode.align) styleParts.push(`text-align: ${imgNode.align}`);
      if (imgNode.float) styleParts.push(`float: ${imgNode.float}`);
      const styleAttr = styleParts.length > 0 ? `style="${styleParts.join('; ')}"` : '';
      const floatAttr = imgNode.float ? `data-float="${imgNode.float}"` : '';
      return `<img src="${escapeHtml(imgNode.url)}" alt="${escapeHtml(imgNode.alt || '')}" ${widthAttr} ${heightAttr} ${alignAttr} ${styleAttr} ${floatAttr} />`;
    }
    case 'video': {
      const vidNode = node as VideoElement;
      const widthAttr = vidNode.width ? `width="${vidNode.width}"` : '';
      const heightAttr = vidNode.height ? `height="${vidNode.height}"` : '';
      const alignAttr = vidNode.align ? `align="${vidNode.align}"` : '';
      const styleAttr = vidNode.align ? `style="text-align: ${vidNode.align}"` : '';
      return `<video src="${escapeHtml(vidNode.url)}" ${widthAttr} ${heightAttr} ${alignAttr} ${styleAttr} controls></video>`;
    }
    case 'divider':
      return '<hr />';
    case 'table':
      return `<table>${children}</table>`;
    case 'table-row':
      return `<tr>${children}</tr>`;
    case 'table-cell': {
      const cellNode = node as TableCellElement;
      return cellNode.isHeader ? `<th>${children}</th>` : `<td>${children}</td>`;
    }
    default:
      return children;
  }
};

/**
 * Escapa HTML para prevenir XSS
 */
const escapeHtml = (unsafe: string): string => {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

/**
 * Valor inicial padrão do editor
 */
export const getDefaultValue = (): Descendant[] => [
  {
    type: 'paragraph' as const,
    children: [{ text: '' }],
  } as CustomElement,
];

/**
 * Valida se um valor é válido para o editor
 */
export const isValidValue = (value: unknown): value is Descendant[] => {
  try {
    if (!Array.isArray(value) || value.length === 0) return false;

    // Validação mínima para garantir que o primeiro elemento é um objeto válido do Slate
    const firstNode = value[0];
    if (!firstNode || typeof firstNode !== 'object') return false;

    // Elementos devem ter children que é um array não-vazio
    if ('children' in firstNode) {
      return Array.isArray(firstNode.children) && firstNode.children.length > 0;
    }

    // Se for um nó de texto puro (raro como primeiro nó no Slate, mas possível)
    return 'text' in firstNode;
  } catch {
    return false;
  }
};
