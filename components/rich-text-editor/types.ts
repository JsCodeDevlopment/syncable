/**
 * Tipos e interfaces para o Rich Text Editor
 *
 * Este arquivo contém todas as definições de tipos usadas pelo editor de texto rico.
 * Inclui tipos para elementos, formatação, plugins e configurações.
 */

import { BaseEditor, Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

/**
 * Tipos de formatação de texto disponíveis
 */
export type TextFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'subscript' | 'superscript';

/**
 * Tipos de alinhamento de texto
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Tipos de elementos do editor
 */
export type ElementType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'heading-four'
  | 'heading-five'
  | 'heading-six'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'code-block'
  | 'link'
  | 'image'
  | 'video'
  | 'divider'
  | 'table'
  | 'table-row'
  | 'table-cell';

/**
 * Interface base para formatação de texto
 */
export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
}

/**
 * Interface base para elementos do editor
 */
export interface BaseElement {
  type: ElementType;
  align?: TextAlign;
  children: Descendant[];
}

/**
 * Elemento de parágrafo
 */
export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
}

/**
 * Elemento de cabeçalho
 */
export interface HeadingElement extends BaseElement {
  type: 'heading-one' | 'heading-two' | 'heading-three' | 'heading-four' | 'heading-five' | 'heading-six';
}

/**
 * Elemento de citação
 */
export interface BlockQuoteElement extends BaseElement {
  type: 'block-quote';
}

/**
 * Elemento de lista
 */
export interface ListElement extends BaseElement {
  type: 'bulleted-list' | 'numbered-list';
}

/**
 * Item de lista
 */
export interface ListItemElement extends BaseElement {
  type: 'list-item';
}

/**
 * Elemento de bloco de código
 */
export interface CodeBlockElement extends BaseElement {
  type: 'code-block';
  language?: string;
}

/**
 * Elemento de link
 */
export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
  target?: '_blank' | '_self';
}

/**
 * Elemento de imagem
 */
export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  caption?: string;
  align?: 'left' | 'center' | 'right';
  float?: 'left' | 'right';
}

/**
 * Elemento de vídeo
 */
export interface VideoElement extends BaseElement {
  type: 'video';
  url: string;
  width?: number | string;
  height?: number | string;
  caption?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Elemento de divisor
 */
export interface DividerElement extends BaseElement {
  type: 'divider';
  children: [{ text: '' }];
}

/**
 * Elemento de tabela
 */
export interface TableElement extends BaseElement {
  type: 'table';
}

/**
 * Linha de tabela
 */
export interface TableRowElement extends BaseElement {
  type: 'table-row';
}

/**
 * Célula de tabela
 */
export interface TableCellElement extends BaseElement {
  type: 'table-cell';
  isHeader?: boolean;
}

/**
 * União de todos os tipos de elementos customizados
 */
export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | ListElement
  | ListItemElement
  | CodeBlockElement
  | LinkElement
  | ImageElement
  | VideoElement
  | DividerElement
  | TableElement
  | TableRowElement
  | TableCellElement;

/**
 * Tipo para texto customizado
 */
export type CustomText = FormattedText;

/**
 * Extensão do módulo Slate com tipos customizados
 */
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

/**
 * Configurações do editor
 */
export interface RichTextEditorConfig {
  /** Valor inicial do editor */
  initialValue?: Descendant[];
  /** Se o editor é somente leitura */
  readOnly?: boolean;
  /** Placeholder quando o editor está vazio */
  placeholder?: string;
  /** Altura mínima do editor */
  minHeight?: string;
  /** Altura máxima do editor */
  maxHeight?: string;
  /** Se deve mostrar a barra de ferramentas */
  showToolbar?: boolean;
  /** Se deve auto-focar no mount */
  autoFocus?: boolean;
  /** Callback quando o conteúdo muda */
  onChange?: (value: Descendant[]) => void;
  /** Callback quando há blur */
  onBlur?: () => void;
  /** Callback quando há focus */
  onFocus?: () => void;
  /** CSS classes adicionais */
  className?: string;
  /** Plugins desabilitados */
  disabledPlugins?: string[];
  /** Habilitar upload de imagens */
  enableImageUpload?: boolean;
  /** Callback para upload de imagem */
  onImageUpload?: (file: File) => Promise<string>;
  /** Habilitar upload de vídeos */
  enableVideoUpload?: boolean;
  /** Callback para upload de vídeo */
  onVideoUpload?: (file: File) => Promise<string>;
  /** Habilitar inserção de tabelas */
  enableTable?: boolean;
  /** Habilitar inserção de divisores */
  enableDivider?: boolean;
}

/**
 * Props do componente RichTextEditor
 */
export interface RichTextEditorProps extends RichTextEditorConfig {
  /** ID único para o editor */
  id?: string;
  /** Nome do campo (útil para forms) */
  name?: string;
  /** Valor do editor (para modo controlado) */
  value?: Descendant[];
  /** Modo de funcionamento: controlado ou não controlado */
  mode?: 'controlled' | 'uncontrolled';
  /**
   * Chave externa para forçar remontagem do editor.
   * Útil quando o conteúdo é carregado assincronamente (ex: edição de artigo).
   * Mude este valor quando o conteúdo inicial for carregado da API.
   */
  resetKey?: string | number;
}

/**
 * Props do componente RichTextViewer
 */
export interface RichTextViewerProps {
  /** Conteúdo a ser exibido (modo direto) */
  content?: Descendant[];
  /** Conteúdo em formato JSON (preferido) */
  jsonContent?: Descendant[];
  /** Conteúdo em formato HTML (fallback) ou JSON (migração) */
  htmlContent?: string | Descendant[];
  /** CSS classes adicionais */
  className?: string;
}

/**
 * Tipos de botões da toolbar
 */
export type ToolbarButtonType = 'mark' | 'block' | 'link' | 'image' | 'video' | 'table' | 'color' | 'align' | 'list';

/**
 * Interface para botões da toolbar
 */
export interface ToolbarButton {
  id: string;
  type: ToolbarButtonType;
  icon: React.ReactNode;
  label: string;
  action: string;
  isActive?: (editor: BaseEditor & ReactEditor & HistoryEditor) => boolean;
}

/**
 * Grupos de botões da toolbar
 */
export interface ToolbarGroup {
  id: string;
  buttons: ToolbarButton[];
}
