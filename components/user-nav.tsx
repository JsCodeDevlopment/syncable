"use client";

import { getCurrentUser, User } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    id: 0,
    name: "Guest",
    email: "guest@guest.com",
    created_at: new Date(),
    updated_at: new Date(),
  });

  useEffect(() => {
    const getUserData = async () => {
      const user = await getCurrentUser();
      user && setUser(user);
    };
    getUserData();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500" />
          <Avatar className="h-10 w-10 bg-background text-foreground font-semibold text-sm border-2 border-border/50 relative">
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 bg-background/95 backdrop-blur-md border-border/50 shadow-2xl p-2 rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none tracking-tight">{user.name}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup className="p-1">
          {[
            { name: "Dashboard", icon: "⊞", href: "/dashboard" },
            { name: "Reports", icon: "📊", href: "/reports" },
            { name: "Settings", icon: "⚙", href: "/settings" },
          ].map((item) => (
            <DropdownMenuItem 
              key={item.href}
              className="rounded-lg cursor-pointer flex items-center gap-2 py-2.5 px-3 focus:bg-primary/10 focus:text-primary transition-colors font-medium text-sm"
              onClick={() => router.push(item.href)}
            >
              <span className="text-lg opacity-50">{item.icon}</span>
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="p-1">
          <DropdownMenuItem 
            className="rounded-lg cursor-pointer text-red-500 py-2.5 px-3 focus:bg-red-500/10 focus:text-red-600 transition-colors font-medium text-sm"
            onClick={() => router.push("/login")}
          >
            <span className="text-lg opacity-50 mr-2">⎗</span>
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
