import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeletePet } from '@/hooks/useSettings'
import { Loader2 } from 'lucide-react'

interface DeletePetDialogProps {
  isOpen: boolean
  onClose: () => void
  petName: string
  petId: string
}

const DeletePetDialog: React.FC<DeletePetDialogProps> = ({ isOpen, onClose, petName, petId }) => {
  const deletePet = useDeletePet()

  const handleDelete = async () => {
    try {
      await deletePet.mutateAsync(petId)
      onClose()
    } catch (error) {
      console.error('Error deleting pet:', error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente a {petName} y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePet.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePet.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeletePetDialog
