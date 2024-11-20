import React from 'react';
import { Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Box } from "@radix-ui/themes";

export const ChatInterface: React.FC = () => {
  return (
    <div className="chat-container">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box className="chat-content">
            <Box className="messages">
              <div className="message-list">
                {/* Message content here */}
              </div>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
