# OneLife - Your Life. One Local AI.

OneLife is a privacy-first, local AI life assistant that keeps all your data on your device. No cloud, no tracking, complete privacy.

## 🎯 Product Vision

**OneLife** = One Local AI + Your Life Data + 100+ Tools

- **100% Local AI** - All processing happens on your device (WebGPU)
- **Zero Cloud** - No backend servers, no data upload
- **One Interface** - Unified chat entry for all life management
- **Expandable Tools** - 100+ life tools integrated

## 📁 Project Structure

```
onelifeai.xyz/
├── index.html              # Homepage
├── about.html              # About page
├── privacy.html            # Privacy policy
├── manifesto.html          # Local-first manifesto
├── manifest.json           # PWA manifest
├── robots.txt              # SEO robots file
├── sitemap.xml             # SEO sitemap
├── vercel.json             # Vercel deployment config
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   ├── chat.css        # Chat page styles
│   │   ├── records.css    # Records page styles
│   │   ├── tools.css       # Tools page styles
│   │   └── settings.css    # Settings page styles
│   ├── js/
│   │   ├── main.js         # Core utilities (Storage, IndexedDB)
│   │   ├── chat.js         # AI Chat functionality
│   │   ├── records.js      # Records page functionality
│   │   └── settings.js     # Settings page functionality
│   ├── icons/              # PWA icons (to be added)
│   └── images/             # Images (to be added)
├── ai/
│   └── index.html          # AI Chat page
├── records/
│   └── index.html          # Life Records Hub
├── tools/
│   └── index.html          # Tools showcase
└── settings/
    └── index.html          # Settings page
```

## 🚀 Features

### Core Modules

1. **AI Chat** (`/ai/chat`)
   - Local LLM inference (WebGPU)
   - Natural language processing
   - Automatic data structuring
   - Expense, todo, mood, health detection

2. **Life Records Hub** (`/records`)
   - Expenses tracking
   - Todo/Calendar management
   - Mood logging
   - Health data
   - Notes and memos

3. **Tools Center** (`/tools`)
   - Health tools (BMI, TDEE, etc.)
   - Finance tools (Mortgage, Loan, etc.)
   - Productivity tools
   - AI tools
   - Converters & Utilities

4. **Settings** (`/settings`)
   - Model selection
   - Privacy settings
   - Data export/import
   - Notifications

## 🛠️ Technology Stack

- **Frontend**: Pure HTML/CSS/JavaScript
- **Storage**: IndexedDB (local database)
- **PWA**: Service Worker, Web App Manifest
- **AI**: WebGPU/WebAssembly (for future LLM integration)
- **Deployment**: Vercel

## 📝 Data Storage

All data is stored locally using:
- **IndexedDB**: For structured data (records, knowledge base)
- **LocalStorage**: For settings and preferences
- **AES Encryption**: For sensitive data (optional)

## 🔒 Privacy

- ✅ 100% local processing
- ✅ No cloud servers
- ✅ No data collection
- ✅ No tracking
- ✅ No analytics
- ✅ Open source (client-side code)

## 🔗 Integration with Existing Tools

OneLife integrates with existing tool websites:
- `bmicalc.cc` - BMI Calculator
- `mortgagecalc.cc` - Mortgage Calculator
- `passwordgen.cc` - Password Generator
- And 15+ more tools...

All tools are linked from the Tools page and can be accessed directly.

## 📱 PWA Support

OneLife is a Progressive Web App (PWA):
- Installable on desktop and mobile
- Offline support (with Service Worker)
- App-like experience
- Home screen shortcuts

## 🚧 Future Enhancements

- [ ] WebGPU LLM integration (local AI model)
- [ ] Vector embeddings for RAG
- [ ] Advanced analytics and insights
- [ ] Calendar view with reminders
- [ ] Knowledge base search
- [ ] More tool integrations
- [ ] Desktop app (Electron/Tauri)
- [ ] Mobile app (PWA → Native)

## 📄 License

This project is part of the OneLife ecosystem. All code is client-side and runs in the browser.

## 🤝 Contributing

This is a local-first project. All contributions should maintain the privacy-first principle:
- No data collection
- No external dependencies that track users
- All processing must be local

## 📧 Contact

For questions or feedback, please contact: contact@onelifeai.xyz

---

**OneLife** - Your life. One local AI. 🔒

