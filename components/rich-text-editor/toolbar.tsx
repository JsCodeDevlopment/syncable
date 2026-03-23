/**
 * Barra de Ferramentas do Rich Text Editor
 *
 * Este arquivo contém a barra de ferramentas com todos os botões
 * e controles de formatação do editor.
 */

'use client';

import React, { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image,
  Video,
  Link as LinkIcon,
  Table,
  Minus,
  Palette,
  Type,
  Undo,
  Redo,
  Highlighter,
} from 'lucide-react';
import { useSlate, useSlateStatic } from 'slate-react';
import { toast } from 'sonner';

import {
  isMarkActive,
  toggleMark,
  isBlockActive,
  isAlignActive,
  toggleBlock,
  toggleAlign,
  insertLink,
  insertImage,
  insertVideo,
  insertDivider,
  insertTable,
  setTextColor,
  setBackgroundColor,
  setFontSize,
} from './utils';

/**
 * Props da Toolbar
 */
interface ToolbarProps {
  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;
  enableImageUpload?: boolean;
  enableVideoUpload?: boolean;
  enableTable?: boolean;
  enableDivider?: boolean;
}

/**
 * Componente da Toolbar
 */
export const Toolbar: React.FC<ToolbarProps> = ({ onImageUpload, onVideoUpload, enableImageUpload = true, enableVideoUpload = true, enableTable = true, enableDivider = true }) => {
  return (
    <TooltipProvider>
      <div className="bg-background sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b p-2">
        {/* Histórico */}
        <ToolbarGroup>
          <UndoButton />
          <RedoButton />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Formatação de texto */}
        <ToolbarGroup>
          <MarkButton format="bold" icon={<Bold size={18} />} label="Negrito (Ctrl+B)" />
          <MarkButton format="italic" icon={<Italic size={18} />} label="Itálico (Ctrl+I)" />
          <MarkButton format="underline" icon={<Underline size={18} />} label="Sublinhado (Ctrl+U)" />
          <MarkButton format="strikethrough" icon={<Strikethrough size={18} />} label="Tachado" />
          <MarkButton format="code" icon={<Code size={18} />} label="Código inline" />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Subscript e Superscript */}
        <ToolbarGroup>
          <MarkButton format="subscript" icon={<Subscript size={18} />} label="Subscrito" />
          <MarkButton format="superscript" icon={<Superscript size={18} />} label="Sobrescrito" />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Cabeçalhos */}
        <ToolbarGroup>
          <BlockButton type="heading-one" icon={<Heading1 size={18} />} label="Título 1" />
          <BlockButton type="heading-two" icon={<Heading2 size={18} />} label="Título 2" />
          <BlockButton type="heading-three" icon={<Heading3 size={18} />} label="Título 3" />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Alinhamento */}
        <ToolbarGroup>
          <AlignButton align="left" icon={<AlignLeft size={18} />} label="Alinhar à esquerda" />
          <AlignButton align="center" icon={<AlignCenter size={18} />} label="Centralizar" />
          <AlignButton align="right" icon={<AlignRight size={18} />} label="Alinhar à direita" />
          <AlignButton align="justify" icon={<AlignJustify size={18} />} label="Justificar" />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Listas */}
        <ToolbarGroup>
          <BlockButton type="bulleted-list" icon={<List size={18} />} label="Lista com marcadores" />
          <BlockButton type="numbered-list" icon={<ListOrdered size={18} />} label="Lista numerada" />
          <BlockButton type="block-quote" icon={<Quote size={18} />} label="Citação" />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Cores e tamanho de fonte */}
        <ToolbarGroup>
          <ColorPicker />
          <BackgroundColorPicker />
          <FontSizePicker />
        </ToolbarGroup>

        <Separator orientation="vertical" className="h-6" />

        {/* Mídia e elementos */}
        <ToolbarGroup>
          <LinkButton />
          {enableImageUpload && <ImageButton onImageUpload={onImageUpload} />}
          {enableVideoUpload && <VideoButton onVideoUpload={onVideoUpload} />}
          {enableTable && <TableButton />}
          {enableDivider && <DividerButton />}
        </ToolbarGroup>
      </div>
    </TooltipProvider>
  );
};

/**
 * Grupo de botões da toolbar
 */
const ToolbarGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex items-center gap-0.5">{children}</div>;
};

/**
 * Botão base da toolbar
 */
interface BaseButtonProps {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const BaseButton: React.FC<BaseButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Botão para formatação de marca (negrito, itálico, etc.)
 */
const MarkButton: React.FC<{
  format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'subscript' | 'superscript';
  icon: React.ReactNode;
  label: string;
}> = ({ format, icon, label }) => {
  const editor = useSlate();
  return <BaseButton active={isMarkActive(editor, format)} onClick={() => toggleMark(editor, format)} icon={icon} label={label} />;
};

/**
 * Botão para formatação de bloco (cabeçalho, lista, etc.)
 */
const BlockButton: React.FC<{
  type: 'heading-one' | 'heading-two' | 'heading-three' | 'bulleted-list' | 'numbered-list' | 'block-quote' | 'code-block';
  icon: React.ReactNode;
  label: string;
}> = ({ type, icon, label }) => {
  const editor = useSlate();
  return <BaseButton active={isBlockActive(editor, type)} onClick={() => toggleBlock(editor, type)} icon={icon} label={label} />;
};

/**
 * Botão para alinhamento de texto
 */
const AlignButton: React.FC<{
  align: 'left' | 'center' | 'right' | 'justify';
  icon: React.ReactNode;
  label: string;
}> = ({ align, icon, label }) => {
  const editor = useSlate();
  return <BaseButton active={isAlignActive(editor, align)} onClick={() => toggleAlign(editor, align)} icon={icon} label={label} />;
};

/**
 * Botão para inserir link
 */
const LinkButton: React.FC = () => {
  const editor = useSlate();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const handleInsert = () => {
    if (url) {
      insertLink(editor, url, text || undefined);
      setUrl('');
      setText('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <LinkIcon size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Inserir Link</h4>
          <div className="space-y-2">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsert();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="link-text">Texto (opcional)</Label>
              <Input
                id="link-text"
                placeholder="Texto do link"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsert();
                  }
                }}
              />
            </div>
            <Button onClick={handleInsert} className="w-full">
              Inserir
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Botão para inserir imagem
 */
const ImageButton: React.FC<{ onImageUpload?: (file: File) => Promise<string> }> = ({ onImageUpload }) => {
  const editor = useSlateStatic();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    if (url) {
      insertImage(editor, url, alt || undefined);
      setUrl('');
      setAlt('');
      setOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!onImageUpload) {
        toast.error('Upload de arquivo não configurado.');
        return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Fazendo upload da imagem...');

    try {
      const uploadedUrl = await onImageUpload(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
        toast.success('Imagem carregada com sucesso!', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Image size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Inserir Imagem</h4>
          <div className="space-y-2">
            {onImageUpload && (
              <div>
                <Label>Fazer Upload</Label>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" disabled={isUploading} />
                {isUploading && <p className="text-muted-foreground mt-1 text-xs">Enviando...</p>}
              </div>
            )}
            <div>
              <Label htmlFor="image-url">URL da Imagem</Label>
              <Input
                id="image-url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsert();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Texto Alternativo</Label>
              <Input
                id="image-alt"
                placeholder="Descrição da imagem"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsert();
                  }
                }}
              />
            </div>
            <Button onClick={handleInsert} className="w-full" disabled={!url || isUploading}>
              {isUploading ? 'Aguarde...' : 'Inserir'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Botão para inserir vídeo
 */
const VideoButton: React.FC<{ onVideoUpload?: (file: File) => Promise<string> }> = ({ onVideoUpload }) => {
  const editor = useSlateStatic();
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    if (url) {
      insertVideo(editor, url);
      setUrl('');
      setOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!onVideoUpload) {
        toast.error('Upload de arquivo não configurado.');
        return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Fazendo upload do vídeo...');

    try {
      const uploadedUrl = await onVideoUpload(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
        toast.success('Vídeo carregado com sucesso!', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Erro ao fazer upload do vídeo.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Video size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Inserir Vídeo</h4>
          <div className="space-y-2">
            {onVideoUpload && (
              <div>
                <Label>Fazer Upload</Label>
                <Input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="cursor-pointer" disabled={isUploading} />
                {isUploading && <p className="text-muted-foreground mt-1 text-xs">Enviando...</p>}
              </div>
            )}
            <div>
              <Label htmlFor="video-url">URL do Vídeo</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=... ou URL direta"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsert();
                  }
                }}
              />
            </div>
            <p className="text-muted-foreground text-xs">Suporta YouTube, Vimeo ou URL direta de vídeo</p>
            <Button onClick={handleInsert} className="w-full" disabled={!url || isUploading}>
              {isUploading ? 'Aguarde...' : 'Inserir'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Botão para inserir tabela
 */
const TableButton: React.FC = () => {
  const editor = useSlate();
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  const [open, setOpen] = useState(false);

  const handleInsert = () => {
    const numRows = parseInt(rows) || 3;
    const numCols = parseInt(cols) || 3;
    insertTable(editor, numRows, numCols);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Table size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Inserir Tabela</h4>
          <div className="space-y-2">
            <div>
              <Label htmlFor="table-rows">Linhas</Label>
              <Input id="table-rows" type="number" min="1" max="20" value={rows} onChange={(e) => setRows(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="table-cols">Colunas</Label>
              <Input id="table-cols" type="number" min="1" max="10" value={cols} onChange={(e) => setCols(e.target.value)} />
            </div>
            <Button onClick={handleInsert} className="w-full">
              Inserir
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Botão para inserir divisor
 */
const DividerButton: React.FC = () => {
  const editor = useSlate();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            insertDivider(editor);
          }}
        >
          <Minus size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Inserir divisor horizontal</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Seletor de cor de texto
 */
const ColorPicker: React.FC = () => {
  const editor = useSlate();
  const [color, setColor] = useState('#000000');
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setTextColor(editor, color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Palette size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Cor do Texto</h4>
          <div className="space-y-2">
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full" />
            <Button onClick={handleApply} className="w-full">
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Seletor de tamanho de fonte
 */
const FontSizePicker: React.FC = () => {
  const editor = useSlate();
  const [open, setOpen] = useState(false);

  const handleSizeChange = (size: string) => {
    setFontSize(editor, size);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Type size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <h4 className="mb-2 font-medium">Tamanho da Fonte</h4>
          <Select onValueChange={handleSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.75rem">Pequeno</SelectItem>
              <SelectItem value="0.875rem">Menor</SelectItem>
              <SelectItem value="1rem">Normal</SelectItem>
              <SelectItem value="1.125rem">Maior</SelectItem>
              <SelectItem value="1.25rem">Grande</SelectItem>
              <SelectItem value="1.5rem">Extra Grande</SelectItem>
              <SelectItem value="2rem">Enorme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Botão de Desfazer (Undo)
 */
const UndoButton: React.FC = () => {
  const editor = useSlate();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.undo();
          }}
        >
          <Undo size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Desfazer (Ctrl+Z)</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Botão de Refazer (Redo)
 */
const RedoButton: React.FC = () => {
  const editor = useSlate();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.redo();
          }}
        >
          <Redo size={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Refazer (Ctrl+Y)</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * Seletor de cor de fundo do texto
 */
const BackgroundColorPicker: React.FC = () => {
  const editor = useSlate();
  const [color, setColor] = useState('#ffff00');
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setBackgroundColor(editor, color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Highlighter size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <h4 className="font-medium">Cor de Fundo</h4>
          <div className="space-y-2">
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full" />
            <Button onClick={handleApply} className="w-full">
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
