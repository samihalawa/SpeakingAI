import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

interface VocabularySearchProps {
  onSearch: (searchTerm: string) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function VocabularySearch({ onSearch, onSortChange }: VocabularySearchProps) {
  const [sortBy, setSortBy] = useState('spanish');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value, sortOrder);
  };

  const handleOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vocabulary..."
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleOrderChange}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Select defaultValue="spanish" onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
            <SelectItem value="lastReviewed">Last Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
