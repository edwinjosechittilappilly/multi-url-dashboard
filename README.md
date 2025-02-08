
# Multi URL Dashboard

A desktop application that allows you to view and manage multiple URLs simultaneously in a customizable dashboard layout.

## Features

- **Multi-Panel View**: Display multiple websites simultaneously in a single window
- **Customizable Layout**: Arrange and resize panels according to your needs
- **Persistent Settings**: Save your dashboard configuration for future sessions
- **Cross-Platform**: Available for both macOS and Windows

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/multi-url-dashboard.git
cd multi-url-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the application
```bash
npm start
```

## Building from Source

### For All Platforms
```bash
npm run build
```

### Platform-Specific Builds

For macOS:
```bash
npm run build:mac
```

For Windows:
```bash
npm run build:win
```

The built applications will be available in the `dist` directory.

## Development

### Project Structure
```
multi-url-dashboard/
├── src/
│   ├── main.js          # Main electron process
│   ├── index.html       # Main application window
│   └── styles/          # CSS styles
├── scripts/
│   └── make.js          # Build script
├── build/               # Build resources
└── dist/               # Compiled binaries
```

### Available Scripts

- `npm start` - Start the application in development mode
- `npm run build` - Build for all platforms
- `npm run build:mac` - Build for macOS
- `npm run build:win` - Build for Windows
- `npm run make` - Run the make script (creates necessary directories)

## Features in Detail

### Dashboard Configuration
- Add multiple URLs to your dashboard
- Drag and resize panels
- Save layout configurations
- Quick reload individual panels
- Navigation controls for each panel

### System Integration
- Native window controls
- System tray integration
- Custom window management

## Technical Details

Built with:
- Electron
- Electron Builder
- Node.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- Electron.js community
- All contributors who have helped with the project

