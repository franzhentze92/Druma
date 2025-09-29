import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Star, Package, User, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItems: Array<{
    id: string;
    item_type: 'product' | 'service';
    item_id: string;
    item_name: string;
    provider_id: string;
    provider_name: string;
  }>;
  onReviewSubmitted: () => void;
}

interface ReviewData {
  productId?: string;
  providerId?: string;
  rating: number;
  comment: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderItems,
  onReviewSubmitted
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [reviews, setReviews] = useState<Map<string, ReviewData>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  // Get unique providers and products from order items
  const providerMap = new Map();
  orderItems.forEach(item => {
    if (!providerMap.has(item.provider_id)) {
      providerMap.set(item.provider_id, {
        id: item.provider_id,
        name: item.provider_name
      });
    }
  });
  const providers = Array.from(providerMap.values());

  // Only handle provider reviews - product reviews removed
  const totalSteps = 1; // Only providers step

  const getCurrentStepType = () => {
    return 'providers';
  };

  const handleRatingChange = (itemId: string, itemType: 'product' | 'provider', rating: number) => {
    const key = `${itemType}_${itemId}`;
    
    setReviews(prev => {
      const newReviews = new Map(prev);
      const existingReview = newReviews.get(key) || { rating: 0, comment: '' };
      newReviews.set(key, { ...existingReview, rating });
      return newReviews;
    });
  };

  const handleCommentChange = (itemId: string, itemType: 'product' | 'provider', comment: string) => {
    const key = `${itemType}_${itemId}`;
    
    setReviews(prev => {
      const newReviews = new Map(prev);
      const existingReview = newReviews.get(key) || { rating: 0, comment: '' };
      newReviews.set(key, { ...existingReview, comment });
      return newReviews;
    });
  };

  const getReview = (itemId: string, itemType: 'product' | 'provider') => {
    const key = `${itemType}_${itemId}`;
    return reviews.get(key) || { rating: 0, comment: '' };
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Submit provider reviews
      for (const [key, review] of reviews) {
        if (key.startsWith('provider_') && review.rating > 0) {
          const providerUserId = key.replace('provider_', '');
          
          // First, get the provider ID from the providers table using user_id
          const { data: providerData, error: providerLookupError } = await supabase
            .from('providers')
            .select('id')
            .eq('user_id', providerUserId)
            .single();

          if (providerLookupError) {
            console.error('Error looking up provider:', providerLookupError);
            continue; // Skip this review if provider not found
          }

          const { error: providerError } = await supabase
            .from('provider_reviews')
            .insert({
              provider_id: providerData.id,
              client_id: (await supabase.auth.getUser()).data.user?.id,
              rating: review.rating,
              comment: review.comment || null
            });

          if (providerError) throw providerError;
        }
      }

      // Only provider reviews are handled - product reviews removed

      toast({
        title: "✅ Reseñas Enviadas",
        description: "Tus reseñas han sido enviadas exitosamente. ¡Gracias por tu feedback!",
        duration: 4000,
      });

      onReviewSubmitted();
      onClose();
      setCurrentStep(0);
      setReviews(new Map());

    } catch (error) {
      console.error('Error submitting reviews:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron enviar las reseñas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Calificar Proveedores
          </DialogTitle>
          <DialogDescription>
            Paso {currentStep + 1} de {totalSteps} - Califica tu experiencia
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Step Header */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-base">
              Calificar Proveedores
            </h3>
            <p className="text-xs text-gray-600">
              Califica los {providers.length} proveedor{providers.length === 1 ? '' : 'es'} de tu orden
            </p>
          </div>

          {/* Provider Reviews */}
          <div className="space-y-4">
            {providers.length > 0 ? (
              providers.map((provider) => {
                const review = getReview(provider.id, 'provider');
                return (
                  <div key={`provider-${provider.id}`} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-sm">{provider.name}</h4>
                        <p className="text-xs text-gray-600">Proveedor</p>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Calificación</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(provider.id, 'provider', star)}
                            className={`p-1 rounded transition-colors ${
                              star <= review.rating
                                ? 'text-yellow-400 bg-yellow-50'
                                : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Comentario (opcional)</label>
                      <Textarea
                        placeholder="Comparte tu experiencia con este proveedor..."
                        value={review.comment}
                        onChange={(e) => handleCommentChange(provider.id, 'provider', e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay proveedores para calificar en esta orden</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 space-y-4 pt-4 border-t">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso</span>
              <span>{currentStep + 1} de {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={submitting}
            >
              {currentStep === totalSteps - 1 ? 'Saltar Todo' : 'Saltar'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Enviando...' : currentStep === totalSteps - 1 ? 'Enviar Reseñas' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
