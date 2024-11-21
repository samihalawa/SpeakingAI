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
    if (!a[sortBy] || !b[sortBy]) return 0;
    const dateA = new Date(a[sortBy] || new Date());
    const dateB = new Date(b[sortBy] || new Date());
    return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const filteredVocabulary = sortedVocabulary.filter(item => {
    const word = item.word?.toLowerCase() || '';
    const translation = item.translation?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    return word.includes(searchTermLower) || translation.includes(searchTermLower);
  });

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
