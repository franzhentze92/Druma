import React, { useState } from 'react';
import { MessageCircle, Bot, Users, Calendar, Send, Phone, Video } from 'lucide-react';

const Comunicacion: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'chat', label: 'Chat AI', icon: Bot, color: 'from-purple-500 to-indigo-500' },
    { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
    { id: 'reuniones', label: 'Reuniones', icon: Calendar, color: 'from-green-500 to-emerald-500' },
  ];

  const chatMessages = [
    { type: 'bot', message: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' },
    { type: 'user', message: 'Mi perro no quiere comer su comida habitual' },
    { type: 'bot', message: 'Entiendo tu preocupación. Esto puede ser normal. Te sugiero: 1) Verificar si la comida está fresca, 2) Intentar mezclar con algo que le guste, 3) Consultar al veterinario si persiste más de 2 días.' },
  ];

  const conversations = [
    { name: 'Dr. García', lastMessage: 'Los resultados están listos', time: '10:30 AM', unread: 2, avatar: '👨‍⚕️' },
    { name: 'Grooming Plus', lastMessage: 'Cita confirmada para mañana', time: '9:15 AM', unread: 0, avatar: '✂️' },
    { name: 'Centro Canino', lastMessage: 'Clase de entrenamiento', time: 'Ayer', unread: 1, avatar: '🎾' },
  ];

  const meetings = [
    { title: 'Consulta Veterinaria', date: '25 Nov', time: '10:00 AM', type: 'video', doctor: 'Dr. García' },
    { title: 'Sesión de Entrenamiento', date: '26 Nov', time: '4:00 PM', type: 'presencial', doctor: 'Carlos Trainer' },
    { title: 'Grooming Appointment', date: '28 Nov', time: '2:00 PM', type: 'presencial', doctor: 'Grooming Plus' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Comunicación</h2>
        <p className="text-purple-100">Mantente conectado con profesionales y otros dueños</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-2 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-200
              ${activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                : 'text-gray-600 hover:bg-white'
              }
            `}
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-96 flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
              <h3 className="font-bold flex items-center">
                <Bot className="mr-2" size={20} />
                Asistente Virtual Pet Hub
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600">
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'mensajes' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Conversaciones</h3>
            <div className="space-y-3">
              {conversations.map((conv, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl">
                    {conv.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{conv.name}</h4>
                      <span className="text-sm text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                      {conv.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reuniones' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Próximas Reuniones</h3>
            <div className="space-y-4">
              {meetings.map((meeting, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{meeting.title}</h4>
                    <div className="flex items-center space-x-2">
                      {meeting.type === 'video' ? <Video size={16} /> : <Phone size={16} />}
                      <span className="text-sm text-gray-500">{meeting.type}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-1">Con: {meeting.doctor}</p>
                  <p className="text-sm text-gray-500">{meeting.date} a las {meeting.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunicacion;