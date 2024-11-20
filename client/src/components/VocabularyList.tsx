import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ScrollArea,
  ScrollBar
} from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { addWebSocketListener } from "../lib/websocket";
import type { Vocabulary } from "@db/schema";
import { useVirtualizer } from "@tanstack/react-virtual";

const WORD_TYPES = ['noun', 'verb', 'adjective', 'adverb', 'idiom'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function VocabularyList() {
  const [filters, setFilters] = useState({
    search: "",
    wordType: "",
    difficulty: "",
    theme: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vocabulary = [], isLoading } = useQuery<Vocabulary[]>({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });

  // WebSocket listener for real-time updates
  useEffect(() => {
    const unsubscribe = addWebSocketListener((data) => {
      if (data.type === "vocabulary_update") {
        queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const filteredVocabulary = vocabulary.filter((item) => {
    const matchesSearch =
      !filters.search ||
      item.spanish.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.chinese.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.notes?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesWordType = !filters.wordType || filters.wordType === "all" || item.wordType === filters.wordType;
    const matchesDifficulty = !filters.difficulty || filters.difficulty === "all" || item.difficulty === filters.difficulty;
    const matchesTheme = !filters.theme || item.theme === filters.theme;
    const matchesDateFrom = !filters.dateFrom || new Date(item.createdAt) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(item.createdAt) <= new Date(filters.dateTo);

    return (
      matchesSearch &&
      matchesWordType &&
      matchesDifficulty &&
      matchesTheme &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredVocabulary.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = filteredVocabulary[index];
      // Base height for the row
      let height = 60;
      // Add height for example
      if (item?.example) height += 40;
      // Add height for notes
      if (item?.notes) height += 40;
      // Add height for tags if present
      if (item?.tags?.length) height += 30;
      return height;
    },
    overscan: 10,
    measureElement: (element) => {
      // Get the actual rendered height of the element
      return element.getBoundingClientRect().height;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="dates">Date Range</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="p-4 bg-card rounded-lg">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsCommandOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Quick Search
            </Button>

        <Command className={`rounded-lg border shadow-md ${isCommandOpen ? '' : 'hidden'}`}>
          <CommandInput placeholder="Search vocabulary..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Words">
              {filteredVocabulary.map((item) => (
                <CommandItem key={item.id} onSelect={() => {
                  setFilters({ ...filters, search: item.spanish });
                  setIsCommandOpen(false);
                }}>
                  {item.spanish} - {item.chinese}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.wordType}
            onValueChange={(value) => setFilters({ ...filters, wordType: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Word Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">All Types</SelectItem>
              {WORD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty}
            onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">All Levels</SelectItem>
              {DIFFICULTIES.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-[180px]"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-[180px]"
          />
        </div>
      </div>
    </TabsContent>
  </Tabs>

  <ScrollArea className="h-[600px] rounded-md border" ref={parentRef}>
        <Table>
          <ScrollBar orientation="horizontal" />
          <TableHeader>
            <TableRow>
              <TableHead>Spanish</TableHead>
              <TableHead>Chinese</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Reviewed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = filteredVocabulary[virtualRow.index];
              return (
                <TableRow
                  key={item.id}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TableCell className="font-medium">
                    <Collapsible>
                      {({ open }: { open: boolean }) => (
                        <>
                          <CollapsibleTrigger className="flex items-center gap-2 w-full transition-all duration-200 hover:bg-accent/10 rounded px-2 py-1">
                            <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="cursor-help">{item.spanish}</span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{item.spanish}</h4>
                            <Separator />
                            <p className="text-sm">{item.chinese}</p>
                            {item.example && (
                              <>
                                <Separator />
                                <p className="text-sm text-muted-foreground">{item.example}</p>
                              </>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">{item.wordType}</Badge>
                              <Badge variant="outline">{item.difficulty}</Badge>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                            {open ? (
                              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                            ) : (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 space-y-2 animate-accordion-down">
                            {item.example && (
                              <div className="pl-2 border-l-2 border-primary/20">
                                <p className="text-sm text-muted-foreground">{item.example}</p>
                              </div>
                            )}
                            {item.notes && (
                              <div className="pl-2 border-l-2 border-primary/20">
                                <p className="text-sm text-muted-foreground">{item.notes}</p>
                              </div>
                            )}
                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  const now = new Date().toISOString();
                                  fetch(`/api/vocabulary/${item.id}/review`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ lastReviewed: now })
                                  }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
                                  });
                                }}
                              >
                                Mark as Reviewed
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </>
                      )}
                    </Collapsible>
                  </TableCell>
                  <TableCell>{item.chinese}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.wordType}</Badge>
                  </TableCell>
                  <TableCell>
                    {Array.isArray(item.tags) && item.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="mr-1">
                        {tag}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.lastReviewed), "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
