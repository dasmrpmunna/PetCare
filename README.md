# PetCare

A mobile app for managing your pet's daily and weekly care routines. Track feeding, walking, medication, grooming, and more — with today's checklist, SMS delegation to caregivers, and gesture controls.

## Features

- **User accounts** — register and log in; your session persists across launches
- **Pet management** — add, view, edit, and delete pets (species, breed, age, weight, gender, notes)
- **Care tasks** — create daily or weekly tasks with categories, scheduled times, and descriptions
- **Today's checklist** — see all tasks due today with a progress bar; daily tasks auto-reset each morning
- **Care routines** — browse all tasks filtered by day of the week
- **SMS delegation** — send a pre-filled text message to a caregiver with pet and task details
- **Gesture controls**
  - Swipe left on a checklist task to delete
  - Swipe right on a checklist task to mark it complete
  - Shake your device to reset today's checklist
- **Local data persistence** — all data is stored on-device and survives app restarts

## Tech Stack

- [Expo](https://expo.dev/) SDK 57 with Expo Router
- React Native 0.86
- TypeScript
- AsyncStorage for local data persistence
- expo-sensors for shake detection
- Lucide icons

## Prerequisites

Before you begin, install the following on your computer:

| Requirement | Windows | macOS |
|---|---|---|
| **Node.js** (v18 or newer) | Download from [nodejs.org](https://nodejs.org) (use the Windows installer) | Download from [nodejs.org](https://nodejs.org) (use the macOS installer), or install via Homebrew: `brew install node` |
| **VS Code** | Download from [code.visualstudio.com](https://code.visualstudio.com) | Download from [code.visualstudio.com](https://code.visualstudio.com) |
| **Expo Go** (on your phone) | Install from the Play Store (Android) or App Store (iPhone) | Install from the Play Store (Android) or App Store (iPhone) |

Verify Node.js is installed by opening a terminal and running:

```
node --version
```

You should see a version number starting with `v18` or higher.

---

## Step 1 — Set Up the Project

### On Windows

1. Open **VS Code**
2. Go to **File > Open Folder** and select this project folder
3. Open the integrated terminal: **Terminal > New Terminal** (or press `` Ctrl + ` ``)
4. Install dependencies:

```
npm install
```

### On macOS

1. Open **VS Code**
2. Go to **File > Open Folder** and select this project folder
3. Open the integrated terminal: **Terminal > New Terminal** (or press `` Cmd + ` ``)
4. Install dependencies:

```
npm install
```

Wait for the installation to finish. You'll see a `node_modules` folder appear in the project.

---

## Step 2 — Run the App on Your Phone with Expo Go

### On a Windows PC (Android or iPhone)

1. Make sure your phone and computer are connected to the **same Wi-Fi network**
2. Open the **Expo Go** app on your phone
3. In the VS Code terminal, start the dev server:

```
npm run dev
```

4. A **QR code** will appear in the terminal
5. **On Android**: open Expo Go and tap **Scan QR code**, then point your camera at the QR code
6. **On iPhone**: open the Camera app, point it at the QR code, and tap the Expo Go notification — or open Expo Go and scan directly
7. The app loads on your phone within a few seconds

### On a MacBook (Android or iPhone)

1. Make sure your phone and MacBook are on the **same Wi-Fi network**
2. Open the **Expo Go** app on your phone
3. In the VS Code terminal, start the dev server:

```
npm run dev
```

4. A **QR code** will appear in the terminal
5. **On iPhone**: open the Camera app, point it at the QR code on your MacBook screen, and tap the Expo Go notification
6. **On Android**: open Expo Go and tap **Scan QR code**
7. The app loads on your phone within a few seconds

### If the QR code doesn't work

Press `s` in the terminal to switch to **Tunnel mode**. This works even if your phone and computer aren't on the same network. Then scan the new QR code.

### Troubleshooting

| Problem | Solution |
|---|---|
| "Unable to connect" error | Make sure both devices are on the same Wi-Fi, or press `s` to switch to Tunnel mode |
| App loads slowly | The first load bundles the JavaScript — this can take 30+ seconds on slow networks. Be patient. |
| Shake-to-reset doesn't work | Some phones don't support it. Use the **Reset** button on the Today's Checklist screen instead. |
| Changes not showing on phone | The app auto-reloads when you save files. If it doesn't, shake your phone and tap **Reload**. |
| "Unrecognized dependency" warning | Run `npx expo install --fix` to align all packages, then restart the dev server. |

---

## Step 3 — Build an APK for Android

An APK is a standalone installable file — your app runs without Expo Go.

### Prerequisites

1. Create a free Expo account at [expo.dev](https://expo.dev/signup)
2. Install the EAS CLI on your computer:

```
npm install -g eas-cli
```

3. Log in to your Expo account:

```
eas login
```

Enter the email and password you used to sign up.

### Build the APK

1. Configure the build:

```
eas build:configure
```

2. Start the Android build:

```
eas build:android --profile preview
```

3. When prompted, choose **APK** (not app bundle/AAB)
4. The build runs in the cloud — you'll see a progress bar and a shareable link
5. When it finishes, you'll get a download link for your `.apk` file
6. Download the APK, transfer it to your Android phone, and install it

> The first build can take 10-20 minutes. Subsequent builds are faster due to caching.

### Build a production version (for Play Store)

If you later want to publish to the Google Play Store:

```
eas build:android --profile production
```

This produces an **AAB** (Android App Bundle) file, which is what the Play Store requires.

---

## Project Structure

```
app/                    # App screens (Expo Router file-based routing)
  _layout.tsx           # Root layout with auth and data providers
  index.tsx             # Splash screen
  login.tsx             # Login screen
  register.tsx          # Registration screen
  (tabs)/               # Tab navigation screens
    dashboard.tsx       # Home dashboard
    pets.tsx            # Pet list
    checklist.tsx       # Today's checklist (swipe + shake gestures)
    routines.tsx        # All care routines with day filter
    settings.tsx        # Settings and logout
  pet/                  # Pet management screens
    add.tsx             # Add a new pet
    [id]/index.tsx      # Pet detail view
    [id]/edit.tsx       # Edit a pet
  task/                 # Task management screens
    add.tsx             # Add a new task
    [id]/index.tsx      # Task detail view
    [id]/edit.tsx       # Edit a task
  sms-delegation.tsx    # SMS delegation screen
components/              # Reusable UI components
lib/                    # Data layer, auth, storage, theme, types
hooks/                  # Custom hooks
assets/                 # Images and icons
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Expo dev server |
| `npm run build:web` | Build the web version |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run the linter |

## License

This project is for personal use.
