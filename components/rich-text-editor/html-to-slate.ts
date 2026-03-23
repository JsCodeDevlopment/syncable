/**
 * Utilitário para conversão de HTML em Slate Nodes (Descendants)
 *
 * Este arquivo contém a lógica necessária para transformar HTML puro
 * no formato de dados que o Slate entende. Útil para renderizar 
 * conteúdo de APIs que retornam HTML ou legado.
 */

import { Descendant, Text } from 'slate';
import { CustomElement, ElementType, TextAlign } from './types';

/**
 * Converte HTML ou JSON em Descendants do Slate
 */
export const getRichTextContent = (jsonContent?: Descendant[], htmlContent?: string | Descendant[]): Descendant[] => {
  // Se já temos JSON válido, usa ele
  if (jsonContent && Array.isArray(jsonContent) && jsonContent.length > 0) {
    return jsonContent;
  }

  // Se htmlContent é na verdade um array de Descendants (legado), usa ele
  if (Array.isArray(htmlContent)) {
    return htmlContent;
  }

  // Se temos HTML string, faz a conversão
  if (typeof htmlContent === 'string' && htmlContent.trim()) {
    return deserializeHtml(htmlContent);
  }

  // Fallback padrão: um parágrafo vazio
  return [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    } as CustomElement,
  ];
};

/**
 * Desserializa uma string HTML em Descendants do Slate
 */
export const deserializeHtml = (html: string): Descendant[] => {
  if (typeof window === 'undefined') return [];

  const document = new DOMParser().parseFromString(html, 'text/html');
  const body = document.body;

  const nodes = deserialize(body);
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
  const filteredNodes = nodeArray.filter((n): n is Descendant => n !== null);

  // Garante que o Slate sempre tenha pelo menos um nó
  if (filteredNodes.length === 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  return filteredNodes;
};

/**
 * Função recursiva para converter nós do DOM em Descendants do Slate
 */
const deserialize = (el: Node): (Descendant | null)[] | Descendant | null => {
  if (el.nodeType === 3) {
    return { text: el.textContent || '' };
  }

  if (el.nodeType !== 1) {
    return null;
  }

  const element = el as HTMLElement;
  const nodeName = element.nodeName;

  let parent = el;

  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat()
    .filter((n): n is Descendant => n !== null);

  const style = element.getAttribute('style');
  const alignMatch = style?.match(/text-align:\s*(\w+)/);
  const align = alignMatch ? (alignMatch[1] as TextAlign) : undefined;

  switch (nodeName) {
    case 'BODY':
      return children;
    case 'P':
      return { type: 'paragraph', align, children };
    case 'H1':
      return { type: 'heading-one', align, children };
    case 'H2':
      return { type: 'heading-two', align, children };
    case 'H3':
      return { type: 'heading-three', align, children };
    case 'H4':
      return { type: 'heading-four', align, children };
    case 'H5':
      return { type: 'heading-five', align, children };
    case 'H6':
      return { type: 'heading-six', align, children };
    case 'BLOCKQUOTE':
      return { type: 'block-quote', align, children };
    case 'UL':
      return { type: 'bulleted-list', children };
    case 'OL':
      return { type: 'numbered-list', children };
    case 'LI':
      return { type: 'list-item', children };
    case 'PRE':
      return { type: 'code-block', children };
    case 'A':
      return {
        type: 'link',
        url: element.getAttribute('href') || '',
        target: element.getAttribute('target') as '_blank' | '_self' | undefined,
        children,
      };
    case 'IMG':
      return {
        type: 'image',
        url: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        width: element.getAttribute('width') || '100%',
        height: element.getAttribute('height') || 'auto',
        float: element.getAttribute('data-float') as 'left' | 'right' | undefined,
        align: element.getAttribute('align') as 'left' | 'center' | 'right' | undefined,
        children: [{ text: '' }],
      };
    case 'VIDEO':
      return {
        type: 'video',
        url: element.getAttribute('src') || '',
        width: element.getAttribute('width') || '100%',
        height: element.getAttribute('height') || 'auto',
        align: element.getAttribute('align') as 'left' | 'center' | 'right' | undefined,
        children: [{ text: '' }],
      };
    case 'HR':
      return { type: 'divider', children: [{ text: '' }] };
    case 'TABLE':
      return { type: 'table', children };
    case 'TR':
      return { type: 'table-row', children };
    case 'TD':
    case 'TH':
      return {
        type: 'table-cell',
        isHeader: nodeName === 'TH',
        children: [{ type: 'paragraph', children }],
      };
    case 'BR':
      return { text: '\n' };
    case 'STRONG':
    case 'B':
      return applyMark(children, 'bold');
    case 'EM':
    case 'I':
      return applyMark(children, 'italic');
    case 'U':
      return applyMark(children, 'underline');
    case 'S':
      return applyMark(children, 'strikethrough');
    case 'CODE':
      return applyMark(children, 'code');
    case 'SUB':
      return applyMark(children, 'subscript');
    case 'SUP':
      return applyMark(children, 'superscript');
    case 'SPAN': {
      let res: any = children;
      const color = element.style.color;
      const bgColor = element.style.backgroundColor;
      const fontSize = element.style.fontSize;

      if (color) res = applyMark(res, 'color', color);
      if (bgColor) res = applyMark(res, 'backgroundColor', bgColor);
      if (fontSize) res = applyMark(res, 'fontSize', fontSize);

      return res;
    }
    default:
      return children;
  }
};

/**
 * Aplica uma marca do Slate recursivamente a nós de texto
 */
const applyMark = (nodes: any[], key: string, value: any = true): any[] => {
  return nodes.map((node) => {
    if (Text.isText(node)) {
      return { ...node, [key]: value };
    }
    if (node.children) {
      return { ...node, children: applyMark(node.children, key, value) };
    }
    return node;
  });
};
