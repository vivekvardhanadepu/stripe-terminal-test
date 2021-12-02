import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import createHooks from "./hooks";
import createConnectionService from "./connectionService";

const { RNStripeTerminal } = NativeModules;

class StripeTerminal {
  // Device types
  DeviceTypeChipper2X = RNStripeTerminal.DeviceTypeChipper2X;

  // Discovery methods
  DiscoveryMethodBluetoothScan = RNStripeTerminal.DiscoveryMethodBluetoothScan;
  DiscoveryMethodBluetoothProximity =
    RNStripeTerminal.DiscoveryMethodBluetoothProximity;

  // Payment intent statuses
  PaymentIntentStatusRequiresPaymentMethod =
    RNStripeTerminal.PaymentIntentStatusRequiresPaymentMethod;
  PaymentIntentStatusRequiresConfirmation =
    RNStripeTerminal.PaymentIntentStatusRequiresConfirmation;
  PaymentIntentStatusRequiresCapture =
    RNStripeTerminal.PaymentIntentStatusRequiresCapture;
  PaymentIntentStatusCanceled = RNStripeTerminal.PaymentIntentStatusCanceled;
  PaymentIntentStatusSucceeded = RNStripeTerminal.PaymentIntentStatusSucceeded;

  // Reader events
  ReaderEventCardInserted = RNStripeTerminal.ReaderEventCardInserted;
  ReaderEventCardRemoved = RNStripeTerminal.ReaderEventCardRemoved;

  // Payment status
  PaymentStatusNotReady = RNStripeTerminal.PaymentStatusNotReady;
  PaymentStatusReady = RNStripeTerminal.PaymentStatusReady;
  PaymentStatusWaitingForInput = RNStripeTerminal.PaymentStatusWaitingForInput;
  PaymentStatusProcessing = RNStripeTerminal.PaymentStatusProcessing;

  // Connection status
  ConnectionStatusNotConnected = RNStripeTerminal.ConnectionStatusNotConnected;
  ConnectionStatusConnected = RNStripeTerminal.ConnectionStatusConnected;
  ConnectionStatusConnecting = RNStripeTerminal.ConnectionStatusConnecting;

  // Fetch connection token. Overwritten in call to initialize
  _fetchConnectionToken = () =>
    Promise.reject("You must initialize RNStripeTerminal first.");

  constructor() {
    this.listener = new NativeEventEmitter(RNStripeTerminal);
    this.listener.addListener("requestConnectionToken", () => {
      console.log("requestConnectionToken");
      this._fetchConnectionToken()
        .then((token) => {
          if (token) {
            RNStripeTerminal.setConnectionToken(token, null);
          } else {
            throw new Error(
              "User-supplied `fetchConnectionToken` resolved successfully, but no token was returned."
            );
          }
        })
        .catch((err) =>
          RNStripeTerminal.setConnectionToken(
            null,
            err.message || "Error in user-supplied `fetchConnectionToken`."
          )
        );
    });

    this._createListeners([
      "log",
      "readersDiscovered",
      "abortDiscoverReadersCompletion",
      "readerSoftwareUpdateProgress",
      "didRequestReaderInput",
      "didRequestReaderDisplayMessage",
      "didReportReaderEvent",
      "didReportLowBatteryWarning",
      "didChangePaymentStatus",
      "didChangeConnectionStatus",
      "didReportUnexpectedReaderDisconnect",
      "didReportAvailableUpdate",
      "didStartInstallingUpdate",
      "didReportReaderSoftwareUpdateProgress",
      "didFinishInstallingUpdate",
    ]);
  }

  _createListeners(keys) {
    keys.forEach((k) => {
      console.log(
        "creating listener for",
        `add${k[0].toUpperCase() + k.substring(1)}Listener`
      );
      this[`add${k[0].toUpperCase() + k.substring(1)}Listener`] = (
        listener
      ) => {
        console.log("adding listener for", k);
        this.listener.addListener(k, listener);
      };
      this[`remove${k[0].toUpperCase() + k.substring(1)}Listener`] = (
        listener
      ) => this.listener.removeListener(k, listener);
    });
  }

  _wrapPromiseReturn(event, call, key) {
    console.log("event", event);
    return new Promise((resolve, reject) => {
      console.log("getting into promise", event);
      const subscription = this.listener.addListener(event, (data) => {
        console.log("whatever", data);
        if (data && data.error) {
          reject(data);
        } else {
          resolve(key ? data[key] : data);
        }
        console.log("removing listener for", data);
        subscription.remove();
      });

      call();
    });
  }

  initialize({ fetchConnectionToken }) {
    this._fetchConnectionToken = fetchConnectionToken;
    // console.log("fetchConnectionTopek", this._fetchConnectionToken);
    // this._fetchConnectionToken()
    //   .then((token) => {
    //     if (token) {
    //       RNStripeTerminal.setConnectionToken(token, null);
    //     } else {
    //       throw new Error(
    //         "User-supplied `fetchConnectionToken` resolved successfully, but no token was returned."
    //       );
    //     }
    //   })
    //   .catch((err) =>
    //     RNStripeTerminal.setConnectionToken(
    //       null,
    //       err.message || "Error in user-supplied `fetchConnectionToken`."
    //     )
    //   );
    return new Promise((resolve, reject) => {
      if (Platform.OS === "android") {
        RNStripeTerminal.initialize((status) => {
          if (status.isInitialized === true) {
            resolve();
          } else {
            reject(status.error);
          }
        });
      } else {
        RNStripeTerminal.initialize();
        resolve();
      }
    });
  }

  discoverReaders(method, simulated) {
    return this._wrapPromiseReturn("readerDiscoveryCompletion", () => {
      RNStripeTerminal.discoverReaders(method, simulated);
    });
  }

  // readerDiscoveryCompletion() {
  //   return this._wrapPromiseReturn(
  //     'readerDiscoveryCompletion',
  //     () => {

  //     }
  //   );
  // }

  checkForUpdate() {
    return this._wrapPromiseReturn(
      "updateCheck",
      () => {
        RNStripeTerminal.checkForUpdate();
      },
      "update"
    );
  }

  installUpdate() {
    return this._wrapPromiseReturn("updateInstall", () => {
      RNStripeTerminal.installUpdate();
    });
  }

  connectReader(serialNumber, locationId) {
    return this._wrapPromiseReturn("readerConnection", () => {
      RNStripeTerminal.connectReader(serialNumber, locationId);
    });
  }

  disconnectReader() {
    return this._wrapPromiseReturn("readerDisconnectCompletion", () => {
      RNStripeTerminal.disconnectReader();
    });
  }

  getConnectedReader() {
    return this._wrapPromiseReturn("connectedReader", () => {
      RNStripeTerminal.getConnectedReader();
    }).then((data) => (data.serialNumber ? data : null));
  }

  getConnectionStatus() {
    return this._wrapPromiseReturn("connectionStatus", () => {
      RNStripeTerminal.getConnectionStatus();
    });
  }

  getPaymentStatus() {
    return this._wrapPromiseReturn("paymentStatus", () => {
      RNStripeTerminal.getPaymentStatus();
    });
  }

  getLastReaderEvent() {
    return this._wrapPromiseReturn("lastReaderEvent", () => {
      RNStripeTerminal.getLastReaderEvent();
    });
  }

  createPayment(options) {
    return this._wrapPromiseReturn(
      "paymentCreation",
      () => {
        RNStripeTerminal.createPayment(options);
      },
      "intent"
    );
  }

  createPaymentIntent(options) {
    return this._wrapPromiseReturn(
      "paymentIntentCreation",
      () => {
        RNStripeTerminal.createPaymentIntent(options);
      },
      "intent"
    );
  }

  retrievePaymentIntent(clientSecret) {
    return this._wrapPromiseReturn(
      "paymentIntentRetrieval",
      () => {
        RNStripeTerminal.retrievePaymentIntent(clientSecret);
      },
      "intent"
    );
  }

  collectPaymentMethod() {
    return this._wrapPromiseReturn(
      "paymentMethodCollection",
      () => {
        RNStripeTerminal.collectPaymentMethod();
      },
      "intent"
    );
  }

  processPayment() {
    return this._wrapPromiseReturn(
      "paymentProcess",
      () => {
        RNStripeTerminal.processPayment();
      },
      "intent"
    );
  }

  cancelPaymentIntent() {
    return this._wrapPromiseReturn(
      "paymentIntentCancel",
      () => {
        RNStripeTerminal.cancelPaymentIntent();
      },
      "intent"
    );
  }

  abortCreatePayment() {
    return this._wrapPromiseReturn("abortCreatePaymentCompletion", () => {
      RNStripeTerminal.abortCreatePayment();
    });
  }

  abortDiscoverReaders() {
    return this._wrapPromiseReturn("abortDiscoverReadersCompletion", () => {
      RNStripeTerminal.abortDiscoverReaders();
    });
  }

  abortInstallUpdate() {
    return this._wrapPromiseReturn("abortInstallUpdateCompletion", () => {
      RNStripeTerminal.abortInstallUpdate();
    });
  }

  startService(options) {
    if (typeof options === "string") {
      options = { policy: options };
    }

    if (this._currentService) {
      return Promise.reject(
        "A service is already running. You must stop it using `stopService` before starting a new service."
      );
    }

    this._currentService = createConnectionService(this, options);
    this._currentService.start();
    return this._currentService;
  }

  stopService() {
    if (!this._currentService) {
      return Promise.resolve();
    }

    return this._currentService.stop().then(() => {
      this._currentService = null;
    });
  }
}

const StripeTerminal_ = new StripeTerminal();
export default StripeTerminal_;

export const {
  useStripeTerminalState,
  useStripeTerminalCreatePayment,
  useStripeTerminalConnectionManager,
} = createHooks(StripeTerminal_);
