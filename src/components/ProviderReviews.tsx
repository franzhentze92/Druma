import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Star, User, Calendar } from 'lucide-react';

interface ProviderReview {
  id: string;
  provider_id: string;
  client_id: string;
  rating: number;
  comment: string;
  created_at: string;
  auth_users: {
    email: string;
  };
}


const ProviderReviews: React.FC = () => {
  const { user } = useAuth();
  const [providerReviews, setProviderReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // First, get the provider ID from the providers table using user_id
        const { data: providerData, error: providerLookupError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (providerLookupError) {
          console.error('Error looking up provider:', providerLookupError);
          setProviderReviews([]);
          return;
        }

        // Fetch provider reviews using the correct provider ID
        const { data: providerReviewsData, error: providerError } = await supabase
          .from('provider_reviews')
          .select(`
            *,
            auth_users!provider_reviews_client_id_fkey (
              email
            )
          `)
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (providerError) throw providerError;

        setProviderReviews(providerReviewsData || []);

      } catch (error) {
        console.error('Error fetching reviews:', error);
        setProviderReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallRating = () => {
    if (providerReviews.length === 0) return { average: 0, count: 0 };
    
    const totalRating = providerReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: totalRating / providerReviews.length,
      count: providerReviews.length
    };
  };

  const overallRating = getOverallRating();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reseñas Recibidas</h1>
        <p className="text-gray-600">Gestiona las reseñas de tus clientes</p>
      </div>

      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Resumen de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getRatingColor(overallRating.average)}`}>
                {overallRating.average.toFixed(1)}
              </div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(overallRating.average)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-gray-600">
              <p className="text-lg font-medium">{overallRating.count} reseñas de proveedor</p>
              <p className="text-sm">
                Calificación promedio de tus servicios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Reseñas de Proveedor ({providerReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providerReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay reseñas de proveedor aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {providerReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {review.auth_users?.email || 'Usuario Anónimo'}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ProviderReviews;
