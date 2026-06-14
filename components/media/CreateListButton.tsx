"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { CreateListModal } from "./CreateListModal";
import { useRouter } from "next/navigation";

export function CreateListButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 h-auto text-sm transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        Create List
      </Button>

      {isOpen && (
        <CreateListModal
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
