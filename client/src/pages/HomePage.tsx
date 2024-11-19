import { ChatInterface } from "../components/ChatInterface";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-[#E25822]">¡Bienvenidos!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Spanish with AI</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatInterface />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Practice with our AI tutor</li>
              <li>Save new words to your vocabulary list</li>
              <li>Review your progress regularly</li>
              <li>Use example sentences in context</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
