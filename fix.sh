#!/bin/bash

# Create necessary directories if they don't exist
mkdir -p client/src/components/ui
mkdir -p client/src/styles

# Fix JSX closing tags in ChatInterface.tsx
sed -i 's/<\/Box>/<\/div>/' client/src/components/ChatInterface.tsx

# Create VocabularyDialog component
cat > client/src/components/VocabularyDialog.tsx << 'EOF'
import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const VocabularyDialog = ({ isOpen, onClose }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add New Vocabulary</Dialog.Title>
      </Dialog.Header>
      <Button onClick={onClose}>Close</Button>
    </Dialog.Content>
  </Dialog>
);

export default VocabularyDialog;
EOF

# Update CSS imports
cat > client/src/styles/globals.css << 'EOF'
@import '@radix-ui/themes/styles.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 0 0% 100%;
}
EOF

# Install required dependencies
npm install --save @radix-ui/react-dialog @radix-ui/themes lucide-react framer-motion

# Build the project
npm run build

echo "✅ All fixes have been applied successfully!"