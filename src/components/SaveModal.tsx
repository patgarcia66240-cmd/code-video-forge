import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { MdSave, MdUpdate } from "react-icons/md";

interface SaveModalProps {
    isOpen: boolean;
    type: 'create' | 'update';
    fileName: string;
    code: string;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const SaveModal = ({
    isOpen,
    type,
    fileName,
    code,
    isLoading,
    onCancel,
    onConfirm
}: SaveModalProps) => {
    if (!isOpen) {
        return null;
    }

    const isUpdate = type === 'update';

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogOverlay className="backdrop-blur-sm z-50" />
            <DialogContent className="sm:max-w-md z-50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 mb-3">
                        {isUpdate ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <MdUpdate className="w-4 h-4 text-orange-600" />
                                </div>
                                Mettre à jour le code
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <MdSave className="w-4 h-4 text-green-600" />
                                </div>
                                Sauvegarder le code dans vos collections
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-white/80 mt-2">
                        {isUpdate
                            ? `Le code "${fileName}" existe déjà. Voulez-vous le mettre à jour avec les modifications actuelles ?`
                            : `Ajouter le fichier "${fileName}" dans vos collections ?`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 pb-2" >
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    {isUpdate ? 'Mise à jour...' : 'Sauvegarde...'}
                                </>
                            ) : (
                                <>
                                    {isUpdate ? (
                                        <>
                                            <MdUpdate className="w-4 h-4 mr-2" />
                                            Mettre à jour
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="w-4 h-4 mr-2" />
                                            Sauvegarder
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Footer Note */}
                    <div className="text-xs text-muted-foreground text-center">
                        {isUpdate
                            ? "L'ancien code sera remplacé par la version actuelle"
                            : "Une vignette sera automatiquement générée pour prévisualiser votre code"
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SaveModal;