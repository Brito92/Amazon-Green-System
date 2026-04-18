"use client"

import { useState } from "react"
import { Send, Users, Search, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  time: string
  isOwn: boolean
}

interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "Comunidade Produtores",
    avatar: "CP",
    lastMessage: "Maria: Alguém tem dicas sobre Açaí?",
    time: "10:30",
    unread: 3,
    online: true,
  },
  {
    id: "2",
    name: "João Santos",
    avatar: "JS",
    lastMessage: "Obrigado pela ajuda!",
    time: "09:15",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Suporte Técnico",
    avatar: "ST",
    lastMessage: "Como posso ajudar?",
    time: "Ontem",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Ana Costa",
    avatar: "AC",
    lastMessage: "Vamos trocar sementes?",
    time: "Ontem",
    unread: 0,
    online: false,
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Maria Silva",
    avatar: "MS",
    content: "Olá pessoal! Alguém tem dicas sobre o cultivo de Açaí em área de várzea?",
    time: "10:25",
    isOwn: false,
  },
  {
    id: "2",
    sender: "João Santos",
    avatar: "JS",
    content: "Oi Maria! Na várzea é importante cuidar da drenagem. O Açaí gosta de umidade mas não de encharcamento constante.",
    time: "10:27",
    isOwn: false,
  },
  {
    id: "3",
    sender: "Você",
    avatar: "EU",
    content: "Verdade! Eu uso cobertura morta para ajudar a regular a umidade. Funciona muito bem!",
    time: "10:28",
    isOwn: true,
  },
  {
    id: "4",
    sender: "Maria Silva",
    avatar: "MS",
    content: "Que ótimas dicas! Vocês poderiam me mostrar fotos de como fazem?",
    time: "10:30",
    isOwn: false,
  },
]

export function ChatScreen() {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "Você",
      avatar: "EU",
      content: newMessage,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <MessageCircle className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bater Papo</h1>
          <p className="text-muted-foreground">Conecte-se com outros produtores</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Lista de Contatos */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversas</CardTitle>
              <Badge variant="secondary">{contacts.length}</Badge>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-100px)]">
              <div className="space-y-1 p-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedContact.id === contact.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback className="bg-secondary/20 text-secondary">
                          {contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{contact.name}</p>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {contact.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Header do Chat */}
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarFallback className="bg-secondary/20 text-secondary">
                    {selectedContact.avatar}
                  </AvatarFallback>
                </Avatar>
                {selectedContact.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedContact.online ? "Online agora" : "Offline"}
                </p>
              </div>
              {selectedContact.id === "1" && (
                <Badge variant="outline" className="ml-auto">
                  <Users className="mr-1 h-3 w-3" />
                  24 membros
                </Badge>
              )}
            </div>
          </CardHeader>

          {/* Mensagens */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${
                        message.isOwn ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                      }`}>
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${message.isOwn ? "text-right" : ""}`}>
                      {!message.isOwn && (
                        <p className="text-sm font-medium mb-1">{message.sender}</p>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input de Mensagem */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
