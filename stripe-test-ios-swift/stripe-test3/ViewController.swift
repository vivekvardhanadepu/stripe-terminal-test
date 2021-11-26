import UIKit
import StripeTerminal

class ViewController: UIViewController {

    var discoverCancelable: Cancelable?
    var collectCancelable: Cancelable?

    var nextActionButton = UIButton(type: .system)
    var readerMessageLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        setUpInterface()

        // Move this to your App Delegate, in didFinishLaunchingWithOptions.
        // Terminal.setTokenProvider(APIClient.shared)
    }


    @objc
    func discoverReaders() {
        let config = DiscoveryConfiguration(
          discoveryMethod: .bluetoothScan,
          simulated: true
        )

        self.discoverCancelable = Terminal.shared.discoverReaders(config, delegate: self) { error in
            if let error = error {
                print("discoverReaders failed: \(error)")
            } else {
                print("discoverReaders succeeded")
                self.nextActionButton.setTitle("Make a Payment", for: .normal)
                self.nextActionButton.removeTarget(self, action: #selector(self.discoverReaders), for: .touchUpInside)
                self.nextActionButton.addTarget(self, action: #selector(self.collectPayment), for: .touchUpInside)
            }
        }
    }

      
    @objc
    func collectPayment() {
        let params = PaymentIntentParameters(amount: 1000,
                                         currency: "gbp",
                                         paymentMethodTypes: ["card_present"])

        Terminal.shared.createPaymentIntent(params) { createResult, createError in
            if let error = createError {
                print("createPaymentIntent failed: \(error)")
            } else if let paymentIntent = createResult {
                print("createPaymentIntent succeeded")
                Terminal.shared.collectPaymentMethod(paymentIntent) { collectResult, collectError in
                    if let error = collectError {
                        print("collectPaymentMethod failed: \(error)")
                    } else if let paymentIntent = collectResult {
                        print("collectPaymentMethod succeeded")

                        self.processPayment(paymentIntent)
                    }
                }
            }
        }
    }

    private func processPayment(_ paymentIntent: PaymentIntent) {
        Terminal.shared.processPayment(paymentIntent) { processResult, processError in
            if let error = processError {
                print("processPayment failed: \(error)")
            } else if let processPaymentPaymentIntent = processResult {
                print("processPayment succeeded")

                // Notify your backend to capture the PaymentIntent.
                // PaymentIntents processed with Stripe Terminal must be captured
                // within 24 hours of processing the payment.
                APIClient.shared.capturePaymentIntent(processPaymentPaymentIntent.stripeId) { captureError in
                    if let error = captureError {
                        print("capture failed: \(error)")
                    } else {
                        print("capture succeeded")
                        self.readerMessageLabel.text = "Payment captured"
                    }
                }
            }
        }
    }

    func setUpInterface() {
      readerMessageLabel.textAlignment = .center
      readerMessageLabel.numberOfLines = 0

      nextActionButton.setTitle("Connect to a reader", for: .normal)
      nextActionButton.addTarget(self, action: #selector(discoverReaders), for: .touchUpInside)

      let stackView = UIStackView(arrangedSubviews: [nextActionButton, readerMessageLabel])
      stackView.axis = .vertical
      stackView.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview(stackView)
      NSLayoutConstraint.activate([
          stackView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
          stackView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
          stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
          stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      ])
    }
}

extension ViewController: DiscoveryDelegate {
    func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
        self.readerMessageLabel.text = "\(readers.count) readers found"

        // Select the first reader the SDK discovers. In your app,
        // you should display the available readers to your user, then
        // connect to the reader they've selected.
        guard let selectedReader = readers.first else { return }

        // Only connect if we aren't currently connected.
        guard terminal.connectionStatus == .notConnected else { return }

        
    let connectionConfig = BluetoothConnectionConfiguration(
      // When connecting to a physical reader, your integration should specify either the
      // same location as the last connection (selectedReader.locationId) or a new location
      // of your user's choosing.
      //
      // Since the simulated reader is not associated with a real location, we recommend
      // specifying its existing mock location.
      locationId: selectedReader.locationId!
    )
    Terminal.shared.connectBluetoothReader(selectedReader, delegate: self, connectionConfig: connectionConfig) { reader, error in
            if let reader = reader {
                print("Successfully connected to reader: \(reader)")
            } else if let error = error {
                print("connectReader failed: \(error)")
            }
        }
    }
}

extension ViewController: BluetoothReaderDelegate {
  func reader(_ reader: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
    readerMessageLabel.text = Terminal.stringFromReaderInputOptions(inputOptions)
  }

  func reader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
      readerMessageLabel.text = Terminal.stringFromReaderDisplayMessage(displayMessage)
  }

  func reader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
      // Show UI communicating that a required update has started installing
  }

  func reader(_ reader: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
      // Update the progress of the install
  }

  func reader(_ reader: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
      // Report success or failure of the update
  }

  func reader(_ reader: Reader, didReportAvailableUpdate update: ReaderSoftwareUpdate) {
      // Show UI communicating that an update is available
  }
}

