import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Vocabulary } from "@db/schema";

export function VocabularyList() {
  const { data: vocabulary = [], isLoading } = useQuery<Vocabulary[]>({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Spanish</TableHead>
          <TableHead>Chinese</TableHead>
          <TableHead>Example</TableHead>
          <TableHead>Last Reviewed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vocabulary.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.spanish}</TableCell>
            <TableCell>{item.chinese}</TableCell>
            <TableCell>{item.example}</TableCell>
            <TableCell>
              {format(new Date(item.lastReviewed), "MMM dd, yyyy")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
