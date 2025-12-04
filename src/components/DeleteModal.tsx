import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { SavedCode } from "@/hooks/useCodeStorage";

interface DeleteModalProps {
    isOpen: boolean;
    code: SavedCode | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const DeleteModal = ({ isOpen, code, onCancel, onConfirm }: DeleteModalProps) => {
    if (!isOpen || !code) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogOverlay className=" backdrop-blur-sm z-50" />
            <DialogContent className="sm:max-w-[425px] z-50">
                <DialogHeader>
                    <DialogTitle className="text-destructive flex items-center gap-2 mb-2">
                        <Trash2 className="w-5 h-5" />
                        Supprimer le code
                    </DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer <span className="text-white/80 font-semibold">{code.title}</span> ?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-white/70">Langage:</span>
                                <span className="ml-2">{code.language}</span>
                            </div>
                            <div>
                                <span className="text-white/70">Lignes:</span>
                                <span className="ml-2">{code.code.split('\n').length}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        ⚠️ Cette action est irréversible. Le code sera définitivement supprimé.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                        </>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteModal;