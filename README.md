# JSON Diff Tool - Modern Vue 3 Implementation

A modern, feature-rich JSON comparison tool built with Vue 3, TypeScript, Tailwind CSS, and cutting-edge web technologies.

## ✨ Features

### 🔄 Multi-Page Architecture
- **Home**: Landing page with feature overview and sample data
- **Compare**: Main comparison interface with dual input areas
- **Key Comparison**: Shows structural differences between JSON objects
- **Diff Comparison**: Detailed line-by-line differences with unified diff support
- **Settings**: Customizable preferences and data management
- **History**: Track and revisit previous comparisons

### 🛠️ Core Capabilities
- **Drag & Drop Support**: Multi-file drag & drop with smart placement
- **Real-time Validation**: Instant JSON validation with clear error messages
- **Value Comparison**: Toggle between structure-only or structure+value comparison
- **Export Options**: Export comparison results in multiple formats
- **Modern UI**: Clean, responsive design with hover effects and transitions
- **TypeScript**: Full type safety throughout the application
- **State Management**: Centralized state with Pinia
- **Local Storage**: Persistent settings and comparison history

### 🎨 Modern Tech Stack
- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety and better DX
- **Vue Router 4** for client-side routing
- **Pinia** for state management
- **Tailwind CSS** for modern, utility-first styling
- **Heroicons** for consistent iconography
- **Headless UI** for accessible components
- **Vite** for fast development and optimized builds
- **Bun** for ultra-fast package management

## 🚀 Quick Start

### Prerequisites
- **Bun** (recommended) or Node.js 20.19.0+ / 22.12.0+

### Installation & Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Open http://localhost:5173
```

### Production Build

```bash
# Type check and build
bun run build

# Preview production build
bun run preview
```

### Quality Assurance

```bash
# Type checking
bun run type-check

# Linting and formatting
bun run lint
bun run format

# Unit tests
bun test:unit

# E2E tests
bun test:e2e:dev  # Development
bun test:e2e      # Production
```

## 📁 Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── AppLayout.vue    # Main application layout
│   └── JsonTextarea.vue # JSON input component with drag & drop
├── composables/         # Vue composables for logic reuse
│   ├── useJsonDiff.ts   # JSON comparison logic
│   └── useFileHandler.ts # File handling utilities
├── router/              # Vue Router configuration
│   └── index.ts         # Route definitions
├── stores/              # Pinia stores
│   └── counter.ts       # Main JSON diff store
├── views/               # Page components
│   ├── HomeView.vue     # Landing page
│   ├── CompareView.vue  # Main comparison interface
│   ├── KeyComparisonView.vue    # Key differences view
│   ├── DiffComparisonView.vue   # Detailed diff view
│   ├── SettingsView.vue # Settings and preferences
│   └── HistoryView.vue  # Comparison history
├── style.css            # Global styles and Tailwind imports
└── main.ts              # Application entry point
```

## 🔧 Configuration

### Settings & Preferences
- **Default comparison mode**: Key or Diff comparison
- **Auto-format JSON**: Automatically format pasted JSON
- **Theme support**: Light, dark, or system preference
- **History retention**: Configurable retention period
- **Export/Import**: Backup and restore settings

### Advanced Features
- **Unified Diff**: Traditional patch-style diff output
- **Value Comparison**: Compare both structure and values
- **File Tracking**: Track edited states and original filenames
- **Smart File Handling**: Intelligent file placement on multi-file drops
- **Error Recovery**: Graceful handling of invalid JSON with detailed errors

## 🎯 Usage Guide

### Basic Comparison
1. Navigate to the Compare page
2. Paste JSON content or drag & drop files
3. Choose between Key or Diff comparison modes
4. Toggle "Compare Values" for value-level differences
5. View results with export options

### Advanced Workflows
- **Batch Comparison**: Drop multiple files for automatic placement
- **History Management**: Access previous comparisons from History page
- **Settings Backup**: Export/import settings across devices
- **Format Options**: Various export formats for different use cases

## 🔄 Migration from Old Version

This modern Vue 3 implementation replaces the original single-file HTML application with:
- ✅ Multi-page navigation with Vue Router
- ✅ Centralized state management with Pinia  
- ✅ Component-based architecture for better maintainability
- ✅ TypeScript for type safety and better developer experience
- ✅ Modern build tooling with Vite
- ✅ Enhanced UX with improved drag & drop and error handling
- ✅ Additional features like settings, history, and export options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [diff](https://github.com/kpdecker/jsdiff) - JavaScript text differencing
- [Headless UI](https://headlessui.com/) - Unstyled, accessible UI components
