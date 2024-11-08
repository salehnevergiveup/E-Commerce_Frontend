// components/ChatAssistantPreviewComponent.jsx

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, ShoppingBag } from 'lucide-react';
import sendRequest from '@/services/requests/request-service';
import RequestMethods from '@/enums/request-methods';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom';

function ChatAssistantPreviewComponent() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // User not authenticated, do not render the chat component
        setIsOpen(false);
      } else {
        const userRole = user.role?.toLowerCase();
        const allowedRoles = ['user'];

        // Check if user's role is allowed
        if (
          allowedRoles.length > 0 &&
          !allowedRoles.map(role => role.toLowerCase()).includes(userRole)
        ) {
          // User does not have an allowed role, redirect to unauthorized
          router.replace('/errors/unauthorized');
          toast.error('You are not authorized to access this feature.');
          setIsOpen(false);
        }
      }
    }
  }, [isAuthenticated, user, loading, router]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeMessage = async (message) => {
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, content: '', role: 'assistant', isTyping: true }]);
    
    let currentText = '';
    for (let i = 0; i < message.length; i++) {
      currentText += message[i];
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, content: currentText } 
            : msg
        )
      );
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, isTyping: false } 
          : msg
      )
    );
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setIsTyping(true);
      await typeMessage("Hi! I'm Potato Trade's AI assistant for content creation and better strategies.");
      await typeMessage("⚠️ Please note: AI-generated content may not always be 100% accurate. Always verify important information from reliable sources.");
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), content: userMessage, role: 'user' }]);

    setIsTyping(true);
    try {
      console.log("userMessage: ", userMessage);
      const response = await sendRequest(RequestMethods.POST, '/llm/chat', { message: userMessage }, true);

      console.log("response from the chat assistant: ", response.data);

      if (!response.success) {
        throw new Error('Network response was not ok');
      }

      await typeMessage(response.data);
    } catch (error) {
      console.error('Error:', error);
      await typeMessage("I'm sorry, I encountered an error. Please try again later.");
    } finally {
      setIsTyping(false);
    }
  };

  if (typeof window === 'undefined') {
    return null; // Prevents SSR issues with portals
  }

  if (loading || !isAuthenticated) {
    // Do not render the chat component if loading or not authenticated
    return null;
  }

  return ReactDOM.createPortal(
    <div>
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[380px] h-[500px] flex flex-col shadow-xl rounded-lg overflow-hidden z-50">
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="font-semibold">Potato Trade Assistant</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-orange-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                    {message.isTyping && (
                      <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce ml-1">
                        ·
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isTyping || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>,
    document.body // Renders the chat component at the root of the DOM
  );
}

export default ChatAssistantPreviewComponent;
