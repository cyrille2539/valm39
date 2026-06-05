'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, MessageSquare, Images, Mail } from "lucide-react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminMedia from "@/components/admin/AdminMedia";
import AdminContacts from "@/components/admin/AdminContacts";

function AdminDashboardContent() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-xl font-bold text-foreground">
              Val<span className="text-primary">M39</span>
            </Link>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Déconnexion
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Gestion du contenu</h1>
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts" className="gap-2"><Mail className="h-4 w-4" /> Contacts</TabsTrigger>
            <TabsTrigger value="media" className="gap-2"><Images className="h-4 w-4" /> Médias</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2"><MessageSquare className="h-4 w-4" /> Avis</TabsTrigger>
          </TabsList>
          <TabsContent value="contacts"><AdminContacts /></TabsContent>
          <TabsContent value="media"><AdminMedia /></TabsContent>
          <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
