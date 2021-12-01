# Accept in-person payments

Fully setup android and ios apps to test [in-person payments](https://stripe.com/docs/terminal/integration-builder?reader=wp3&platform=android&country=GB&client=javaclient) using stripe terminal SDKs

## Stripe-test-android-java

### Steps to run the app

- open `stripe-test-android-java` folder using Android Studio
- run the app and backend[donot forget to replace the `BACKEND_URL` in [ApiClient.java](stripe-test-android-java/app/src/main/java/com/example/stripe_test_android_java/ApiClient.java) with yours]

### What I did

- downloaded full app from https://stripe.com/docs/terminal/integration-builder?reader=wp3&platform=android&country=GB&client=javaclient and extracted it
- followed running the backend steps below to run backend
  - replaced the `BACKEND_URL` in ApiClient.java with mine
- initialized an empty android app in Android Studio(select language as `java`)
- copy `*.java` files to `app/src/main/java/com/`
- copied `ViewController.swift` and `APIClient.swift` to the project directory
- added the required key-value pairs from https://stripe.com/docs/terminal/integration-builder?reader=wp3&platform=ios&country=GB&client=swift into `info.plist`
- in `SceneDelegate.swift`, imported `StripeTerminal` and changed line
  ```
  window.rootViewController = UIHostingController(rootView: contentView)
  ```
  to
  ```
  window.rootViewController = ViewController()
  ```
- in `ViewController.swift`, followed line 16

  ```
  Move this to your App Delegate, in didFinishLaunchingWithOptions.
  ```

  ## Stripe-test-ios-swift

### Steps to run the app

- open `stripe-test-ios-swift` folder using XCode(I used 12.5)
- add `StripeTerminal` package via SwiftPackage Manager or drag and drop `StripeTerminal.xcframework` folder or any other way
- run the app and backend[donot forget to replace the `BACKEND_URL` in [APIClient.swift](stripe-test-ios-swift/stripe-test3/APIClient.swift) with yours]

### What I did

- downloaded full app from https://stripe.com/docs/terminal/integration-builder?reader=wp3&platform=ios&country=GB&client=swift and extracted it
- followed running the backend steps below to run backend
  - replaced the `BACKEND_URL` in APIClient.swift with mine
- initialized an empty ios app in Xcode
  - interface: `SwiftUI`
  - life cycle: `UIKit App Delegate`
  - language: `Swift`
- added `StripeTerminal` package to the app
- copied `ViewController.swift` and `APIClient.swift` to the project directory
- added the required key-value pairs from https://stripe.com/docs/terminal/integration-builder?reader=wp3&platform=ios&country=GB&client=swift into `info.plist`
- in `SceneDelegate.swift`, imported `StripeTerminal` and changed line
  ```
  window.rootViewController = UIHostingController(rootView: contentView)
  ```
  to
  ```
  window.rootViewController = ViewController()
  ```
- in `ViewController.swift`, followed line 16

  ```
  Move this to your App Delegate, in didFinishLaunchingWithOptions.
  ```

## Running the backend

1. Build the server

```
npm install
```

2. Run the server

```
npm start
```

3. Go to [http://localhost:4242](http://localhost:4242)
