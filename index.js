{
  data() {
    return {
      isProcessing: false,
      offlineMode: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
      // ... existing data
    }
  },
  methods: {
    async sendMessage() {
      if (this.isProcessing || !this.userInput.trim()) return;
      
      try {
        this.isProcessing = true;
        // ... existing send logic
      } catch (error) {
        this.showToast('Error sending message. Please try again.', 'error');
      } finally {
        this.isProcessing = false;
      }
    },

    async handleFileUpload(event, type = 'image') {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file
      if (!this.allowedFileTypes.includes(file.type)) {
        this.showToast(`Invalid ${type} format. Please use: ${this.allowedFileTypes.join(', ')}`, 'error');
        return;
      }

      if (file.size > this.maxFileSize) {
        this.showToast(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`, 'error');
        return;
      }

      // ... existing upload logic
    },

    // Add offline detection
    checkConnectivity() {
      const updateOnlineStatus = () => {
        this.offlineMode = !navigator.onLine;
        if (this.offlineMode) {
          this.showToast('You are offline. Changes will sync when connection restores.', 'warning');
        }
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    },

    // Improve dark mode persistence
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      document.documentElement.classList.toggle('dark', this.darkMode);
    }
  },
  created() {
    // Initialize dark mode from storage
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', this.darkMode);
    
    // Setup offline detection
    this.checkConnectivity();
  }
} 