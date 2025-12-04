import { supabase } from '@/lib/supabase';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
  backgroundColor?: string;
  textColor?: string;
  lineNumberColor?: string;
  headerBackgroundColor?: string;
}

const defaultOptions: ThumbnailOptions = {
  width: 800,
  height: 600,
  fontSize: 14,
  lineHeight: 20,
  padding: 20,
  backgroundColor: '#1e1e1e',
  textColor: '#d4d4d4',
  lineNumberColor: '#858585',
  headerBackgroundColor: '#2d2d30',
};

/**
 * Génère une vignette pour un code en utilisant HTML5 Canvas
 */
export const generateCodeThumbnail = async (
  code: string,
  language: string = 'python',
  options: Partial<ThumbnailOptions> = {}
): Promise<string> => {
  const opts = { ...defaultOptions, ...options };

  // Créer un canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Impossible de créer le contexte 2D');
  }

  canvas.width = opts.width!;
  canvas.height = opts.height!;

  // Fond principal
  ctx.fillStyle = opts.backgroundColor!;
  ctx.fillRect(0, 0, opts.width!, opts.height!);

  // Header avec nom du fichier
  ctx.fillStyle = opts.headerBackgroundColor!;
  ctx.fillRect(0, 0, opts.width!, 40);

  // Icône et texte du header
  const languageIcon = getLanguageIcon(language);
  const fileName = `code.${getFileExtension(language)}`;

  ctx.fillStyle = '#cccccc';
  ctx.font = '12px monospace';
  ctx.fillText(`${languageIcon} ${fileName}`, 15, 25);

  // Préparer le code
  const lines = code.split('\n');
  const maxLines = Math.floor((opts.height! - 60) / opts.lineHeight!);
  const displayLines = lines.slice(0, maxLines);

  // Paramètres pour le code
  const lineNumberWidth = 40;
  const codeStartX = opts.padding! + lineNumberWidth;
  const codeStartY = 60;

  // Configuration du texte
  ctx.font = `${opts.fontSize}px 'Consolas', 'Monaco', monospace`;
  ctx.textBaseline = 'top';

  // Dessiner les lignes avec numéros
  displayLines.forEach((line, index) => {
    const y = codeStartY + (index * opts.lineHeight!);

    // Numéro de ligne
    ctx.fillStyle = opts.lineNumberColor!;
    const lineNumber = (index + 1).toString().padStart(3, ' ');
    ctx.fillText(lineNumber, opts.padding!, y);

    // Code avec coloration syntaxique simplifiée
    const highlightedLine = highlightSyntax(line, language);
    renderHighlightedLine(ctx, highlightedLine, codeStartX, y, opts.textColor!);
  });

  // Ajouter un effet de flou subtil si nécessaire
  if (displayLines.length < lines.length) {
    ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
    ctx.fillRect(0, opts.height! - 60, opts.width!, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('...', opts.width! / 2, opts.height! - 30);
    ctx.textAlign = 'left';
  }

  // Convertir en blob puis en URL
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        throw new Error('Impossible de générer le blob');
      }
    }, 'image/png', 0.9);
  });
};

/**
 * Coloration syntaxique simplifiée
 */
function highlightSyntax(line: string, language: string): Array<{text: string, color?: string}> {
  const tokens: Array<{text: string, color?: string}> = [];

  // Syntax highlighting basique selon le langage
  if (language === 'python') {
    // Keywords Python
    const keywords = ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'print', 'try', 'except', 'with', 'as'];
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');

    // Strings
    const stringPattern = /(['"])(?:(?=(\\?))\2.)*?\1/g;

    let lastIndex = 0;
    let match;

    // Appliquer la coloration
    while ((match = keywordPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({text: line.substring(lastIndex, match.index)});
      }
      tokens.push({text: match[0], color: '#569cd6'});
      lastIndex = match.index + match[0].length;
    }

    while ((match = stringPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({text: line.substring(lastIndex, match.index)});
      }
      tokens.push({text: match[0], color: '#ce9178'});
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      tokens.push({text: line.substring(lastIndex)});
    }

    // Comments
    if (line.trim().startsWith('#')) {
      tokens.length = 0;
      tokens.push({text: line, color: '#6a9955'});
    }
  } else if (language === 'javascript' || language === 'typescript') {
    // Keywords JavaScript/TypeScript
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'extends'];
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');

    let lastIndex = 0;
    let match;

    while ((match = keywordPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({text: line.substring(lastIndex, match.index)});
      }
      tokens.push({text: match[0], color: '#569cd6'});
      lastIndex = match.index + match[0].length;
    }

    // Comments
    if (line.trim().startsWith('//')) {
      tokens.length = 0;
      tokens.push({text: line, color: '#6a9955'});
    }

    if (lastIndex < line.length) {
      tokens.push({text: line.substring(lastIndex)});
    }
  } else {
    // Pas de coloration syntaxique
    tokens.push({text: line});
  }

  return tokens.length > 0 ? tokens : [{text: line}];
}

/**
 * Rend une ligne avec coloration syntaxique
 */
function renderHighlightedLine(
  ctx: CanvasRenderingContext2D,
  tokens: Array<{text: string, color?: string}>,
  x: number,
  y: number,
  defaultColor: string
) {
  let currentX = x;

  tokens.forEach(token => {
    ctx.fillStyle = token.color || defaultColor;
    ctx.fillText(token.text, currentX, y);
    currentX += ctx.measureText(token.text).width;
  });
}

/**
 * Retourne une icône pour le langage
 */
function getLanguageIcon(language: string): string {
  const icons: { [key: string]: string } = {
    'python': '🐍',
    'javascript': '🟨',
    'typescript': '🔷',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
    'html': '🌐',
    'css': '🎨',
    'json': '📄',
    'sql': '🗃️',
    'php': '🐘',
    'ruby': '💎',
    'go': '🐹',
    'rust': '🦀',
  };
  return icons[language.toLowerCase()] || '📝';
}

/**
 * Retourne l'extension de fichier pour le langage
 */
function getFileExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'sql': 'sql',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
  };
  return extensions[language.toLowerCase()] || 'txt';
}

/**
 * Télécharge une vignette vers Supabase Storage
 */
export const uploadThumbnailToSupabase = async (
  thumbnailUrl: string,
  codeId: string,
  userId: string
): Promise<string | null> => {
  try {
    // Convertir l'URL en blob
    const response = await fetch(thumbnailUrl);
    const blob = await response.blob();

    // Créer un nom de fichier unique
    const fileName = `thumbnails/${userId}/${codeId}/${Date.now()}.png`;

    // Uploader vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('code-thumbnails')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Erreur upload thumbnail:', error);
      return null;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('code-thumbnails')
      .getPublicUrl(fileName);

    return publicUrl;

  } catch (error) {
    console.error('Erreur upload thumbnail:', error);
    return null;
  }
};

/**
 * Génère et upload une vignette complète
 */
export const generateAndUploadThumbnail = async (
  code: string,
  language: string = 'python',
  codeId: string,
  userId: string
): Promise<string | null> => {
  try {
    // Générer la vignette
    const thumbnailUrl = await generateCodeThumbnail(code, language);

    // Uploader vers Supabase
    const publicUrl = await uploadThumbnailToSupabase(thumbnailUrl, codeId, userId);

    // Nettoyer l'URL temporaire
    URL.revokeObjectURL(thumbnailUrl);

    return publicUrl;

  } catch (error) {
    console.error('Erreur génération/upload thumbnail:', error);
    return null;
  }
};