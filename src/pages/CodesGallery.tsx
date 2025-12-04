import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DeleteModal from "@/components/DeleteModal";
import {
    Code,
    Save,
    Trash2,
    Calendar,
    Clock,
    HardDrive,
    ArrowLeft,
    Search,
    Plus,
    Edit3,
    Copy,
    Download,
    Tag,
    FileText,
    RefreshCw,
    Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCodeStorage, SavedCode } from "@/hooks/useCodeStorage";
import { useAuth } from "@/components/AuthProvider";
import VSCodeLayout from "@/components/VSCodeLayout";

interface CodesGalleryProps {
    embedded?: boolean;
    onBack?: () => void;
    onEditCode?: (code: SavedCode) => void;
}

const CodesGallery = ({ embedded = false, onBack, onEditCode }: CodesGalleryProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { savedCodes, deleteCode, updateCode, isLoading, isSupabaseEnabled, loadCodes } = useCodeStorage();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCode, setSelectedCode] = useState<SavedCode | null>(null);
    const [editingCode, setEditingCode] = useState<SavedCode | null>(null);
    const [filterLanguage, setFilterLanguage] = useState<string>("");
    const [deleteModalState, setDeleteModalState] = useState<{
        open: boolean;
        code: SavedCode | null;
    }>({
        open: false,
        code: null
    });
    const stats = useMemo(() => {
        return {
            totalCodes: savedCodes.length,
            totalSize: savedCodes.reduce((acc, code) => acc + (code.code?.length || 0), 0),
            languages: [...new Set(savedCodes.map(code => code.language))].length,
        };
    }, [savedCodes]);

    // Rediriger vers login si l'utilisateur n'est pas connecté (uniquement en mode non-embed)
    useEffect(() => {
        if (!user && !embedded) {
            navigate('/auth');
        }
    }, [user, embedded, navigate]);

    const handleDeleteCode = (code: SavedCode) => {
        setDeleteModalState({ open: true, code });
    };

    const confirmDelete = async () => {
        if (!deleteModalState.code) return;

        const codeId = deleteModalState.code.id;
        setDeleteModalState({ open: false, code: null });

        try {
            await deleteCode(codeId);
            if (selectedCode?.id === codeId) {
                setSelectedCode(null);
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteModalState({ open: false, code: null });
    };

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast({
                title: "Code copié !",
                description: "Le code a été copié dans le presse-papiers",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de copier le code",
                variant: "destructive",
            });
        }
    };

    const handleEditCode = async (updates: Partial<SavedCode>) => {
        if (!editingCode) return;

        const result = await updateCode(editingCode.id, updates);
        if (result) {
            setEditingCode(null);
        }
    };

    const handleOpenCodeForEditing = (code: SavedCode) => {
        // Mettre à jour le titre du document avec le nom du fichier
        document.title = `${code.title} - Code Video Forge`;

        if (embedded && onEditCode) {
            // Mode embeddé : utiliser le callback fourni
            onEditCode(code);
        } else {
            // Mode standalone : naviguer vers l'éditeur avec le code
            navigate('/', { state: { codeToEdit: code } });
        }
    };

    // Restaurer le titre par défaut quand on quitte la page
    useEffect(() => {
        return () => {
            document.title = 'Code Video Forge';
        };
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getLanguageIcon = (language: string) => {
        const langIcons: { [key: string]: string } = {
            'javascript': '🟨',
            'typescript': '🔷',
            'python': '🐍',
            'java': '☕',
            'cpp': '⚙️',
            'c': '⚙️',
            'html': '🌐',
            'css': '🎨',
            'json': '📄',
            'sql': '🗃️',
        };
        return langIcons[language.toLowerCase()] || '📝';
    };

    const filteredCodes = useMemo(() => {
        return savedCodes.filter(code => {
            const matchesSearch = searchTerm === "" ||
                code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesLanguage = filterLanguage === "" || code.language === filterLanguage;

            return matchesSearch && matchesLanguage;
        });
    }, [savedCodes, searchTerm, filterLanguage]);

    const uniqueLanguages = useMemo(() => {
        return [...new Set(savedCodes.map(code => code.language))];
    }, [savedCodes]);

    if (embedded) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Mes Codes</h2>
                    <div className="flex items-center gap-2">
                        <Button onClick={loadCodes} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualiser
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCodes.map(code => (
                        <Card key={code.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenCodeForEditing(code)}>
                            {/* Vignette du code */}
                            <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden group">
                                {/* Overlay d'édition au survol */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                                    <div className="text-white text-center">
                                        <Edit3 className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Éditer ce code</p>
                                    </div>
                                </div>
                                {code.thumbnail ? (
                                    <img
                                        src={code.thumbnail}
                                        alt={code.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback si l'image ne charge pas
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        <span className="text-4xl mb-2">{getLanguageIcon(code.language)}</span>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-300">{code.title}</p>
                                            <p className="text-xs text-gray-500">{code.language}</p>
                                        </div>
                                    </div>
                                )}
                                {/* Badge du langage en haut à droite */}
                                <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                                    {code.language}
                                </Badge>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span>{getLanguageIcon(code.language)}</span>
                                            {code.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(code.created_at)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                    {code.description || 'Aucune description'}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {code.tags?.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                    <span>{formatFileSize(code.code.length)}</span>
                                    <span>{code.code.split('\n').length} lignes</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyCode(code.code);
                                        }}
                                        className="flex-1"
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copier
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCode(code);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCodes.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Aucun code trouvé</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? "Essayez une autre recherche" : "Commencez par sauvegarder votre premier code"}
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Chargement...</p>
                    </div>
                )}

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={deleteModalState.open}
                    code={deleteModalState.code}
                    onCancel={cancelDelete}
                    onConfirm={confirmDelete}
                />
            </div>
        );
    }

    return (
        <VSCodeLayout
            activeView="codes"
            onExplorerClick={() => navigate('/')}
            onSimulationClick={() => navigate('/simulator')}
            onPreviewClick={() => navigate('/preview')}
            onGalleryClick={() => navigate('/gallery')}
        >
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-border bg-vscode-sidebar p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                            <h1 className="text-xl font-semibold">Mes Codes</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={loadCodes} variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                            <Button onClick={() => navigate('/')} variant="default" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Nouveau code
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <Card className="p-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">{stats.totalCodes}</p>
                                    <p className="text-xs text-muted-foreground">Codes</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-3">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">{formatFileSize(stats.totalSize)}</p>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-3">
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">{stats.languages}</p>
                                    <p className="text-xs text-muted-foreground">Langages</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Rechercher un code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                            className="px-3 py-2 border border-border rounded bg-background text-sm"
                        >
                            <option value="">Tous les langages</option>
                            {uniqueLanguages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCodes.map(code => (
                            <Card key={code.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1" onClick={() => handleOpenCodeForEditing(code)}>
                                {/* Vignette du code */}
                                <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden group">
                                    {/* Overlay d'édition au survol */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                                        <div className="text-white text-center">
                                            <Edit3 className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm font-medium">Éditer ce code</p>
                                        </div>
                                    </div>
                                    {code.thumbnail ? (
                                        <img
                                            src={code.thumbnail}
                                            alt={code.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback si l'image ne charge pas
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <span className="text-3xl mb-2">{getLanguageIcon(code.language)}</span>
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-gray-300 line-clamp-1">{code.title}</p>
                                                <p className="text-xs text-gray-500">{code.language}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Badge du langage en haut à droite */}
                                    <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                                        {code.language}
                                    </Badge>
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-sm line-clamp-1">{code.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(code.created_at)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                        {code.description || 'Aucune description'}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {code.tags?.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                        {code.tags && code.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{code.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                        <span>{formatFileSize(code.code.length)}</span>
                                        <span>{code.code.split('\n').length} lignes</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyCode(code.code);
                                            }}
                                            className="flex-1"
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copier
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCode(code);
                                            }}
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCode(code);
                                            }}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredCodes.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <Code className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-medium mb-2">
                                {searchTerm ? "Aucun code trouvé" : "Aucun code sauvegardé"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Essayez une autre recherche ou filtre"
                                    : "Commencez par sauvegarder votre premier code dans l'éditeur"
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => navigate('/')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer mon premier code
                                </Button>
                            )}
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-12">
                            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Chargement de vos codes...</p>
                        </div>
                    )}
                </div>

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={deleteModalState.open}
                    code={deleteModalState.code}
                    onCancel={cancelDelete}
                    onConfirm={confirmDelete}
                />
            </div>
        </VSCodeLayout>
    );
};

export default CodesGallery;