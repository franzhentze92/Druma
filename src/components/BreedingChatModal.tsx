import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, PawPrint, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  read_at?: string;
}

interface ChatRoom {
  id: string;
  breeding_match_id: string;
  owner1_id: string;
  owner2_id: string;
  created_at: string;
  updated_at: string;
}

interface BreedingMatch {
  id: string;
  pet_id: string;
  potential_partner_id: string;
  owner_id: string;
  partner_owner_id: string;
  status: string;
  pet: any;
  potential_partner: any;
  partner_owner?: {
    full_name: string;
    phone?: string;
  };
}

interface BreedingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  breedingMatch: BreedingMatch | null;
}

const BreedingChatModal: React.FC<BreedingChatModalProps> = ({
  isOpen,
  onClose,
  breedingMatch
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && breedingMatch) {
      loadOrCreateChatRoom();
    }
  }, [isOpen, breedingMatch]);

  useEffect(() => {
    if (chatRoom) {
      loadMessages();
      subscribeToMessages();
    }
  }, [chatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadOrCreateChatRoom = async () => {
    if (!breedingMatch || !user) return;

    try {
      setLoading(true);

      // First, try to find existing chat room
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('breeding_match_id', breedingMatch.id)
        .single();

      if (existingRoom) {
        setChatRoom(existingRoom);
        return;
      }

      // If no existing room, create a new one
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          breeding_match_id: breedingMatch.id,
          owner1_id: breedingMatch.owner_id,
          owner2_id: breedingMatch.partner_owner_id
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat room:', createError);
        toast.error('Error al crear el chat');
        return;
      }

      setChatRoom(newRoom);

      // Send a welcome message
      await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: newRoom.id,
          sender_id: user.id,
          message: `¡Hola! Me interesa la solicitud de reproducción entre ${breedingMatch.pet.name} y ${breedingMatch.potential_partner.name}. ¿Podemos coordinar?`,
          message_type: 'system'
        });

    } catch (error) {
      console.error('Error loading/creating chat room:', error);
      toast.error('Error al cargar el chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!chatRoom) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoom.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!chatRoom) return;

    const subscription = supabase
      .channel(`chat_room_${chatRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoom.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || !user || sending) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoom.id,
          sender_id: user.id,
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Error al enviar el mensaje');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherUser = () => {
    if (!breedingMatch || !user) return null;
    
    const isOwner1 = user.id === breedingMatch.owner_id;
    return {
      id: isOwner1 ? breedingMatch.partner_owner_id : breedingMatch.owner_id,
      name: isOwner1 ? breedingMatch.partner_owner?.full_name : 'Tú',
      pet: isOwner1 ? breedingMatch.potential_partner : breedingMatch.pet
    };
  };

  const otherUser = getOtherUser();

  if (!breedingMatch || !otherUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span>Chat de Reproducción</span>
          </DialogTitle>
          
          {/* Pet Match Info */}
          <div className="flex items-center space-x-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                {breedingMatch.pet.image_url ? (
                  <img
                    src={breedingMatch.pet.image_url}
                    alt={breedingMatch.pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{breedingMatch.pet.name}</p>
                <p className="text-xs text-gray-600">{breedingMatch.pet.breed}</p>
              </div>
            </div>
            
            <Heart className="w-4 h-4 text-pink-500" />
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                {breedingMatch.potential_partner.image_url ? (
                  <img
                    src={breedingMatch.potential_partner.image_url}
                    alt={breedingMatch.potential_partner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{breedingMatch.potential_partner.name}</p>
                <p className="text-xs text-gray-600">{breedingMatch.potential_partner.breed}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Inicia la conversación sobre la reproducción</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              const isSystemMessage = message.message_type === 'system';

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isSystemMessage ? 'w-full' : ''}`}>
                    {isSystemMessage ? (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {message.message}
                        </Badge>
                      </div>
                    ) : (
                      <div className={`flex items-start space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {isOwnMessage ? 'Tú' : otherUser.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg px-3 py-2 ${
                          isOwnMessage 
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreedingChatModal;
