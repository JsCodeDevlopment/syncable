/**
 * Componentes de elementos para o Rich Text Editor
 *
 * Este arquivo contém todos os componentes React usados para renderizar
 * os diferentes tipos de elementos do editor (parágrafos, cabeçalhos, etc.)
 */

'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { Trash2, AlignLeft, AlignCenter, AlignRight, PanelLeft, PanelRight, Square, Settings } from 'lucide-react';
import { Transforms } from 'slate';
import { RenderElementProps, RenderLeafProps, useFocused, useSelected, useSlateStatic, ReactEditor, useReadOnly } from 'slate-react';

import { CustomElement } from './types';

/**
 * Componente para renderizar elementos
 */
export const Element = ({ attributes, children, element }: RenderElementProps) => {
  const style = { textAlign: element.align };

  switch (element.type) {
    case 'paragraph':
      return (
        <p style={style} {...attributes} className="my-2">
          {children}
        </p>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes} className="my-4 text-4xl font-bold">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes} className="my-3 text-3xl font-bold">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 style={style} {...attributes} className="my-3 text-2xl font-bold">
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 style={style} {...attributes} className="my-2 text-xl font-bold">
          {children}
        </h4>
      );
    case 'heading-five':
      return (
        <h5 style={style} {...attributes} className="my-2 text-lg font-bold">
          {children}
        </h5>
      );
    case 'heading-six':
      return (
        <h6 style={style} {...attributes} className="my-2 text-base font-bold">
          {children}
        </h6>
      );
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes} className="my-4 border-l-4 border-gray-300 dark:border-gray-700 pl-4 text-gray-600 dark:text-gray-400 italic">
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} className="my-2 list-inside list-disc ml-4">
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} className="my-2 list-inside list-decimal ml-4">
          {children}
        </ol>
      );
    case 'list-item':
      return (
        <li {...attributes} className="my-1">
          {children}
        </li>
      );
    case 'code-block':
      return (
        <pre {...attributes} className="my-2 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100">
          <code>{children}</code>
        </pre>
      );
    case 'link':
      return (
        <LinkElement attributes={attributes} element={element}>
          {children}
        </LinkElement>
      );
    case 'image':
      return (
        <ImageElement attributes={attributes} element={element}>
          {children}
        </ImageElement>
      );
    case 'video':
      return (
        <VideoElement attributes={attributes} element={element}>
          {children}
        </VideoElement>
      );
    case 'divider':
      return (
        <div {...attributes} contentEditable={false}>
          <hr className="my-4 border-gray-300 dark:border-gray-700" />
          {children}
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto my-4">
          <table {...attributes} className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case 'table-row':
      return (
        <tr {...attributes} className="border border-gray-300 dark:border-gray-700">
          {children}
        </tr>
      );
    case 'table-cell': {
      const CellTag = element.isHeader ? 'th' : 'td';
      return (
        <CellTag {...attributes} className={`border border-gray-300 dark:border-gray-700 px-4 py-2 ${element.isHeader ? 'bg-muted font-bold' : ''}`}>
          {children}
        </CellTag>
      );
    }
    default:
      return <p {...attributes}>{children}</p>;
  }
};

/**
 * Componente para renderizar texto formatado
 */
export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const style: React.CSSProperties = {};

  if (leaf.color) {
    style.color = leaf.color;
  }

  if (leaf.backgroundColor) {
    style.backgroundColor = leaf.backgroundColor;
  }

  if (leaf.fontSize) {
    style.fontSize = leaf.fontSize;
  }

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.code) {
    children = <code className="rounded bg-gray-200 dark:bg-gray-800 px-1 py-0.5 font-mono text-sm">{children}</code>;
  }

  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }

  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

/**
 * Componente de Link
 */
const LinkElement = ({ attributes, children, element }: { attributes: RenderElementProps['attributes']; children: React.ReactNode; element: CustomElement }) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <a
      {...attributes}
      href={element.type === 'link' ? element.url : '#'}
      target={element.type === 'link' ? element.target : undefined}
      rel={element.type === 'link' && element.target === '_blank' ? 'noopener noreferrer' : undefined}
      className={`text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 ${selected && focused ? 'ring-2 ring-blue-400' : ''}`}
    >
      {children}
    </a>
  );
};

/**
 * Componente de Imagem com redimensionamento, alinhamento e flutuação (text wrap)
 */
const ImageElement = ({ attributes, children, element }: { attributes: RenderElementProps['attributes']; children: React.ReactNode; element: CustomElement }) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const isReadOnly = useReadOnly();

  if (element.type !== 'image') return null;

  const imageWidth = element.width || 'auto';
  const isAutoWidth = imageWidth === 'auto';
  const isFullWidth = imageWidth === '100%';
  const isFloating = !!element.float && !isFullWidth;
  const align = element.align || 'left';

  const handleResize = (newWidth: string) => {
    const path = ReactEditor.findPath(editor as any, element);
    const updates: Partial<typeof element> = { width: newWidth, height: 'auto' };
    if (newWidth === '100%' && element.float) {
      updates.float = undefined;
    }
    Transforms.setNodes(editor, updates, { at: path });
  };

  const handleAlign = (newAlign: 'left' | 'center' | 'right') => {
    const path = ReactEditor.findPath(editor as any, element);
    Transforms.setNodes(editor, { align: newAlign, float: undefined }, { at: path });
  };

  const handleFloat = (newFloat: 'left' | 'right') => {
    const path = ReactEditor.findPath(editor as any, element);
    const isSame = element.float === newFloat;
    Transforms.setNodes(editor, { float: isSame ? undefined : newFloat }, { at: path });
  };

  const handleDelete = () => {
    const path = ReactEditor.findPath(editor as any, element);
    Transforms.removeNodes(editor, { at: path });
  };

  const sizeOptions = [
    { label: '25%', value: '25%' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
    { label: 'Original', value: 'auto' },
  ];

  const alignOptions = [
    { icon: <AlignLeft size={14} />, value: 'left' as const, label: 'Alinhar à Esquerda' },
    { icon: <AlignCenter size={14} />, value: 'center' as const, label: 'Centralizar' },
    { icon: <AlignRight size={14} />, value: 'right' as const, label: 'Alinhar à Direita' },
  ];

  const layoutOptions = [
    { icon: <Square size={14} />, value: 'block' as const, label: 'Bloco (sem flutuação)' },
    { icon: <PanelLeft size={14} />, value: 'left' as const, label: 'Flutuar à Esquerda' },
    { icon: <PanelRight size={14} />, value: 'right' as const, label: 'Flutuar à Direita' },
  ];

  const activeLayout = element.float || 'block';

  const outerStyle: React.CSSProperties = isFloating
    ? {
        float: element.float as 'left' | 'right',
        width: isAutoWidth ? undefined : imageWidth,
        maxWidth: '75%',
        marginRight: element.float === 'left' ? '1rem' : undefined,
        marginLeft: element.float === 'right' ? '1rem' : undefined,
        marginBottom: '0.5rem',
      }
    : {};

  return (
    <div {...attributes} className={cn(isFloating ? 'my-2' : 'my-6')} style={outerStyle}>
      <div
        contentEditable={false}
        className={cn(!isFloating && 'flex w-full')}
        style={!isFloating ? { justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' } : undefined}
      >
        <div
          className={cn(
            'relative max-w-full transition-all duration-200',
            !isReadOnly && 'group cursor-pointer',
            !isReadOnly && (selected && focused ? 'ring-primary rounded-lg ring-2 ring-offset-2' : 'hover:ring-primary/50 hover:ring-1'),
          )}
          style={{
            width: isFloating ? '100%' : isAutoWidth ? undefined : imageWidth,
          }}
        >
          <img
            src={element.url}
            alt={element.alt || ''}
            style={{
              width: isFloating || !isAutoWidth ? '100%' : 'auto',
              height: element.height || 'auto',
              display: 'block',
            }}
            className="h-auto max-w-full rounded-lg shadow-sm"
          />

          {!isReadOnly && !selected && (
            <div className="absolute top-2 right-2 rounded-full bg-black/40 p-1.5 text-white opacity-60 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Settings size={16} />
            </div>
          )}

          {!isReadOnly && (
            <div
              className={cn(
                'bg-background/95 absolute top-2 right-2 z-50 flex origin-top-right flex-col gap-2 rounded-xl border p-3 shadow-xl backdrop-blur-md transition-all duration-200',
                selected ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0',
              )}
            >
              <div className="mb-1 flex items-center justify-between border-b pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Settings size={14} className="text-primary" />
                  Ajustes da Imagem
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <TooltipProvider>
                {/* Disposição */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Disposição</span>
                  <div className="bg-muted/50 flex gap-1 rounded-lg p-1">
                    {layoutOptions.map((opt) => {
                      const isActive = activeLayout === opt.value;
                      const isDisabled = opt.value !== 'block' && isFullWidth;
                      return (
                        <Tooltip key={opt.value}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={isActive ? 'default' : 'ghost'}
                              size="icon"
                              disabled={isDisabled}
                              className={cn('h-8 flex-1', isActive && 'bg-primary text-primary-foreground')}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (opt.value === 'block') {
                                  const path = ReactEditor.findPath(editor as any, element);
                                  Transforms.setNodes(editor, { float: undefined }, { at: path });
                                } else {
                                  handleFloat(opt.value);
                                }
                              }}
                            >
                              {opt.icon}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{isDisabled ? 'Reduza o tamanho para flutuar' : opt.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>

                {/* Alinhamento — only in block mode */}
                {!isFloating && (
                  <div className="space-y-1.5">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Alinhamento</span>
                    <div className="bg-muted/50 flex gap-1 rounded-lg p-1">
                      {alignOptions.map((opt) => (
                        <Tooltip key={opt.value}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={align === opt.value ? 'default' : 'ghost'}
                              size="icon"
                              className={cn('h-8 flex-1', align === opt.value && 'bg-primary text-primary-foreground')}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAlign(opt.value);
                              }}
                            >
                              {opt.icon}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{opt.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimensões */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Dimensões</span>
                  <div className="bg-muted/50 flex flex-wrap gap-1 rounded-lg p-1">
                    {sizeOptions.map((opt) => (
                      <Tooltip key={opt.value}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant={element.width === opt.value ? 'default' : 'ghost'}
                            size="sm"
                            className={cn('h-7 min-w-[45px] flex-1 px-2 text-[10px] font-bold', element.width === opt.value && 'bg-primary text-primary-foreground')}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleResize(opt.value);
                            }}
                          >
                            {opt.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Redimensionar para {opt.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

/**
 * Componente de Vídeo com redimensionamento e alinhamento
 */
const VideoElement = ({ attributes, children, element }: { attributes: RenderElementProps['attributes']; children: React.ReactNode; element: CustomElement }) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const isReadOnly = useReadOnly();

  if (element.type !== 'video') return null;

  const handleResize = (newWidth: string) => {
    const path = ReactEditor.findPath(editor as any, element);
    const newHeight = newWidth === 'auto' ? '400' : 'auto';
    Transforms.setNodes(editor, { width: newWidth, height: newHeight }, { at: path });
  };

  const handleAlign = (newAlign: 'left' | 'center' | 'right') => {
    const path = ReactEditor.findPath(editor as any, element);
    Transforms.setNodes(editor, { align: newAlign }, { at: path });
  };

  const handleDelete = () => {
    const path = ReactEditor.findPath(editor as any, element);
    Transforms.removeNodes(editor, { at: path });
  };

  // Detecta se é YouTube ou Vimeo
  const isYouTube = element.url.includes('youtube.com') || element.url.includes('youtu.be');
  const isVimeo = element.url.includes('vimeo.com');

  let embedUrl = element.url;

  if (isYouTube) {
    const videoId = element.url.includes('youtu.be') ? element.url.split('youtu.be/')[1]?.split('?')[0] : element.url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (isVimeo) {
    const videoId = element.url.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  const align = element.align || 'left';
  const videoWidth = element.width || (isYouTube || isVimeo ? '100%' : 'auto');
  const isAutoWidth = videoWidth === 'auto';

  return (
    <div {...attributes} className="my-6">
      <div
        contentEditable={false}
        className="flex w-full"
        style={{
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          className={cn(
            'relative max-w-full transition-all duration-200',
            !isReadOnly && 'group cursor-pointer',
            !isReadOnly && (selected && focused ? 'ring-primary rounded-lg ring-2 ring-offset-2' : 'hover:ring-primary/50 hover:ring-1'),
          )}
          style={{
            width: isAutoWidth ? undefined : videoWidth,
          }}
        >
          {isYouTube || isVimeo ? (
            <iframe
              src={embedUrl}
              width="100%"
              height={element.height || '400'}
              className="pointer-events-none rounded-lg shadow-sm"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={element.url}
              style={{
                width: isAutoWidth ? 'auto' : '100%',
                height: element.height || 'auto',
                display: 'block',
              }}
              controls
              className="h-auto max-w-full rounded-lg shadow-sm"
            />
          )}

          {!isReadOnly && !selected && (
            <div className="absolute top-2 right-2 rounded-full bg-black/40 p-1.5 text-white opacity-60 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Settings size={16} />
            </div>
          )}

          {!isReadOnly && (
            <div
              className={cn(
                'bg-background/95 absolute top-2 right-2 z-50 flex origin-top-right flex-col gap-2 rounded-xl border p-3 shadow-xl backdrop-blur-md transition-all duration-200',
                selected ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0',
              )}
            >
              <div className="mb-1 flex items-center justify-between border-b pb-2">
                <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                  <Settings size={14} className="text-primary" />
                  Ajustes do Vídeo
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <TooltipProvider>
                {/* Alinhamento */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Alinhamento</span>
                  <div className="bg-muted/50 flex gap-1 rounded-lg p-1">
                    {[
                      { icon: <AlignLeft size={14} />, value: 'left', label: 'Alinhar à Esquerda' },
                      { icon: <AlignCenter size={14} />, value: 'center', label: 'Centralizar' },
                      { icon: <AlignRight size={14} />, value: 'right', label: 'Alinhar à Direita' },
                    ].map((opt) => (
                      <Tooltip key={opt.value}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant={align === opt.value ? 'default' : 'ghost'}
                            size="icon"
                            className={cn('h-8 flex-1', align === opt.value && 'bg-primary text-primary-foreground')}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAlign(opt.value as 'left' | 'center' | 'right');
                            }}
                          >
                            {opt.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{opt.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Tamanho */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Largura</span>
                  <div className="bg-muted/50 flex gap-1 rounded-lg p-1">
                    <Button
                      type="button"
                      variant={element.width === '50%' ? 'default' : 'ghost'}
                      size="sm"
                      className={cn('h-7 flex-1 px-1.5 text-[10px] font-bold', element.width === '50%' && 'bg-primary text-primary-foreground')}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResize('50%');
                      }}
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant={element.width === '100%' || !element.width ? 'default' : 'ghost'}
                      size="sm"
                      className={cn('h-7 flex-1 px-1.5 text-[10px] font-bold', (element.width === '100%' || !element.width) && 'bg-primary text-primary-foreground')}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResize('100%');
                      }}
                    >
                      100%
                    </Button>
                  </div>
                </div>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
