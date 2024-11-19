import { useState } from "react";
import { VocabularyList } from "../components/VocabularyList";
import { VocabularyForm } from "../components/VocabularyForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function VocabularyPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-[#E25822]">Mi Vocabulario</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Word
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vocabulary</DialogTitle>
            </DialogHeader>
            <VocabularyForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <VocabularyList />
    </div>
  );
}
