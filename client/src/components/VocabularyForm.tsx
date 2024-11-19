import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertVocabularySchema, type InsertVocabulary } from "@db/schema";

interface VocabularyFormProps {
  onSuccess?: () => void;
}

export function VocabularyForm({ onSuccess }: VocabularyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertVocabulary>({
    resolver: zodResolver(insertVocabularySchema),
    defaultValues: {
      spanish: "",
      chinese: "",
      example: "",
      notes: "",
    },
  });

  const addVocabulary = useMutation({
    mutationFn: async (data: InsertVocabulary) => {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add vocabulary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      toast({ title: "Success", description: "Vocabulary added successfully" });
      onSuccess?.();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vocabulary",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => addVocabulary.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="spanish"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spanish Word/Phrase</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chinese"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chinese Translation</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="example"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Example Sentence</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addVocabulary.isPending}>
          Add Word
        </Button>
      </form>
    </Form>
  );
}
