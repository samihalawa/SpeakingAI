#!/bin/bash

# Create backup directory
mkdir -p ./backup/$(date +%Y%m%d_%H%M%S)
cp -r ./client/src/components/* ./backup/$(date +%Y%m%d_%H%M%S)/

# Create types directory if it doesn't exist
mkdir -p ./client/src/types

# Create vocabulary types file
cat > ./client/src/types/vocabulary.ts << 'EOF'
export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '书面';
  example?: string;
  example_translation?: string;
  grammar_notes?: string;
  lastReviewed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyCardProps {
  vocab: VocabularyItem;
  onCardClick: (vocab: VocabularyItem) => void;
}
EOF

# Update VocabularyCard component
cat > ./client/src/components/VocabularyCard.tsx << 'EOF'
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { VocabularyItem } from "@/types/vocabulary";

interface Props {
  vocab: VocabularyItem;
  onCardClick: (vocab: VocabularyItem) => void;
}

export function VocabularyCard({ vocab, onCardClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card 
        className="p-4 hover:bg-accent/60 transition-all cursor-pointer group"
        onClick={() => onCardClick(vocab)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{vocab.word}</h3>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                vocab.usage_type === '正式' ? 'bg-blue-100 text-blue-700' :
                vocab.usage_type === '口语' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {vocab.usage_type}
              </span>
            </div>
            <p className="text-muted-foreground">{vocab.translation}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Card>
    </motion.div>
  );
}
EOF

# Update VocabularyDialog component
cat > ./client/src/components/VocabularyDialog.tsx << 'EOF'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { VocabularyItem } from "@/types/vocabulary";

interface Props {
  vocab: VocabularyItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VocabularyDialog({ vocab, isOpen, onClose, onEdit, onDelete }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{vocab.word}</span>
              <Badge variant={
                vocab.usage_type === '正式' ? 'default' :
                vocab.usage_type === '口语' ? 'secondary' : 'outline'
              }>
                {vocab.usage_type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <motion.div 
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Translation */}
          <div className="space-y-2">
            <h4 className="font-medium">Translation</h4>
            <p className="text-muted-foreground">{vocab.translation}</p>
          </div>

          {/* Example */}
          {vocab.example && (
            <div className="space-y-2">
              <h4 className="font-medium">Example</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p>{vocab.example}</p>
                {vocab.example_translation && (
                  <p className="text-muted-foreground">{vocab.example_translation}</p>
                )}
              </div>
            </div>
          )}

          {/* Grammar Notes */}
          {vocab.grammar_notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Grammar Notes</h4>
              <div className="bg-blue-50 text-blue-900 p-4 rounded-lg">
                <p>{vocab.grammar_notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>Last reviewed: {new Date(vocab.lastReviewed).toLocaleDateString()}</p>
            <p>Added: {new Date(vocab.createdAt).toLocaleDateString()}</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
EOF

# Update VocabularyList component with sorting
cat > ./client/src/components/VocabularyList.tsx << 'EOF'
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VocabularyItem } from "@/types/vocabulary";
import { VocabularyCard } from "./VocabularyCard";
import { VocabularyDialog } from "./VocabularyDialog";
import { VocabularySearch } from "./VocabularySearch";
import { Card } from "@/components/ui/card";

export function VocabularyList() {
  const [selectedVocab, setSelectedVocab] = useState<VocabularyItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastReviewed'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { data: vocabulary = [], refetch } = useQuery<VocabularyItem[]>({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });

  const sortedVocabulary = [...vocabulary].sort((a, b) => {
    const dateA = new Date(a[sortBy]);
    const dateB = new Date(b[sortBy]);
    return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const filteredVocabulary = sortedVocabulary.filter(item =>
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
      <VocabularySearch 
        onSearch={setSearchTerm}
        onSortChange={(by, order) => {
          setSortBy(by as 'createdAt' | 'lastReviewed');
          setSortOrder(order as 'desc' | 'asc');
        }}
      />
      
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {filteredVocabulary.map((vocab) => (
          <VocabularyCard
            key={vocab.id}
            vocab={vocab}
            onCardClick={setSelectedVocab}
          />
        ))}
      </div>

      {selectedVocab && (
        <VocabularyDialog
          vocab={selectedVocab}
          isOpen={!!selectedVocab}
          onClose={() => setSelectedVocab(null)}
          onEdit={() => {/* Implement edit logic */}}
          onDelete={() => {/* Implement delete logic */}}
        />
      )}
    </Card>
  );
}
EOF

# Update permissions
chmod +x ./update_components.sh

echo "Components have been updated successfully!"