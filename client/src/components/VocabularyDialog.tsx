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
