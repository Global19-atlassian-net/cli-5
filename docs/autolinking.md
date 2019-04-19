# Autolinking

Autolinking is a mechanism built into CLI that allows adding a dependency with native components for React Native to be as simple as:

```sh
yarn add react-native-firebase
```

## How does it work

React Native CLI provides a [`config`](./commands.md#config) command which grabs all of the configuration for React Native packages installed in the project (by scanning dependenecies in `package.json`) and outputs it in JSON format.

This information is then used by the projects advertised as platforms (with `react-native` being a default project supporting both iOS and Android platforms) that implement their autolinking behavior.

This design ensures consistent settings for any platform and allows `react-native config` to update the implementation of how to source this information (be it specified filenames, entries in the module’s package.json, etc).

## Platform iOS

The `Podfile` gets the package metadata from `react-native config` and:

1. Adds dependencies via CocoaPods dev pods (using files from a local path).
1. Adds build phase scripts to the App project’s build phase. (see examples below)

This means that all libraries need to ship a Podspec in the root of their folder to work seamlessly. This references the native code that your library depends on, and notes any of its other native dependencies.

The implementation ensures that a library is imported only once, so if you need to have a custom `pod` directive then including it above the function `use_native_modules!`.

Script Phases
A project which wants to add an Xcode script phase to a user's app can use the custom support in iOS auto-linking via custom settings in either the project's `package.json` under `"react-native"` or via a `react-native.config.js` file in the root.

The options for the build phase are passed more-or-less directly to the `Podfile` via `build_phase`. Here's an example of adding the settings in your `package.json`:

```json
{
  "react-native":
   "ios":
     "scriptPhases": {
        "name": "My Dep pre-parser",
        "path": "relative/path/to/script.sh",
        "execution_position": "after_compile"
      }
    }
  }
}
```

`"path"` is an extra option provided to simplify storing the scripts in your repo, it sets `"script"` for you. You can see all available options [here](https://www.rubydoc.info/gems/cocoapods-core/Pod/Podfile/DSL#script_phase-instance_method).

See implementation of [native_modules.rb](https://github.com/react-native-community/cli/blob/master/packages/platform-ios/native_modules.rb).

## Platform Android

1. At build time, before the build script is run, a first gradle plugin (`settings.gradle`) is ran that takes the package metadata from `react-native config` to dynamically include Android library projects into the build.
1. A second plugin then adds those dependencies to the app project and generates a manifest of React Native packages to include in the fully generated file `/android/build/generated/rn/src/main/java/com/facebook/react/PackageList.java`.
1. Finally, at runtime (on startup) the list of React Native packages, generated in step 2, is used to instruct the React Native runtime of what native modules are available.

See implementation of [native_modules.gradle](https://github.com/react-native-community/cli/blob/master/packages/platform-android/native_modules.gradle).

## What do I need to have in my package to make it work?

You’re already using Gradle, so Android support will work by default.

On the iOS side, you will need to ensure you have a Podspec to the root of your repo. The `react-native-webview` Podspec is a good example of a [`package.json`](https://github.com/react-native-community/react-native-webview/blob/master/react-native-webview.podspec)-driven Podspec.

## How can I customize how autolinking works for my package?

A library can add a `react-native.config.js` configuration file, which will customize the defaults.
