/**DiscoveryMethodBluetoothProximity
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  TextInput,
} from "react-native";
import StripeTerminal from "./react-native-stripe-terminal";
import Geolocation from "react-native-geolocation-service";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu",
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isConnecting: false,
      readerConnected: false,
      completedPayment: "loading...",
      displayText: "Loading...",
      connectedReader: "None",
      isSimulated: false,
      locationId: "tml_DzDeZgFF76H5lT",
      locationPermission: false,
      locationEnabled: true,
    };

    this.discover = this.discover.bind(this);
    this.createPayment = this.createPayment.bind(this);
  }

  async askPermission(permission) {
    if (Platform.OS === "android") {
      let granted = await PermissionsAndroid.check(permission);

      if (granted) {
        console.log("location permission 52", this.state.locationPermission);
        this.setState({ locationPermission: true });
        console.log("location permission 54", this.state.locationPermission);
        console.log("You can use the", permission);
      } else {
        try {
          granted = await PermissionsAndroid.request(permission, {
            title: "Example App",
            message: "Example App needs access to your location ",
          });
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.setState({ locationPermission: true });
            console.log("You can use the", permission);
            alert("You can use the " + permission);
          } else {
            console.log("location permission denied");
            alert("Location permission denied");
          }
        } catch (err) {
          console.warn(err);
          console.log("location permission denied");
          alert("Location permission denied");
        }
      }
    }
  }

  async componentDidMount() {
    await this.askPermission(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
    await this.askPermission(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    console.log("location permission", this.state.locationPermission);
    if (this.state.locationPermission && this.state.locationEnabled) {
      StripeTerminal.initialize({
        fetchConnectionToken: () => {
          alert("abracadabra");
          console.log("fetching connection token");
          return fetch("https://wadha.herokuapp.com/connection_token", {
            method: "POST",
          })
            .then((resp) => resp.json())
            .then((data) => {
              console.log("got data fetchConnectionToken", data);
              return data.secret;
            })
            .catch((err) => {
              alert("fetchConnectionToken " + JSON.stringify(err));
            });
        },
      })
        .then((data) => {
          console.log("initialize", data);
          return data.secret;
        })
        .catch((err) => {
          alert("initialize: " + JSON.stringify(err));
        });

      const discoverListener = StripeTerminal.addReadersDiscoveredListener(
        (readers) => {
          console.log("readers discovered", readers);
          for (let i = 0; i < readers.length; i++) {
            alert(readers[i].serialNumber);
          }
          if (
            readers.length &&
            !this.state.readerConnected &&
            !this.state.isConnecting
          ) {
            this.setState({ isConnecting: true });
            StripeTerminal.connectReader(
              readers[0].serialNumber,
              this.state.locationId
            )
              .then(() => {
                console.log("connected to reader");
                this.setState({
                  isConnecting: false,
                  connectedReader: readers[0].serialNumber,
                  completedPayment: "connected to reader",
                });
              })
              .catch((e) => {
                console.log("failed to connect", e);
                alert("failed to connect " + JSON.stringify(e));
              });
          }
        }
      );

      // This firing without error does not mean the SDK is not still discovering. Just that it found readers.
      // The SDK must be actively discovering in order to connect.
      const discoverCompleteListener = StripeTerminal.addAbortDiscoverReadersCompletionListener(
        (data) => {
          console.log("AbortDiscoverReadersCompletionListener");
          if (data.error) {
            this.setState({
              completedPayment: "Discovery completed with error: " + data.error,
            });
          }
        }
      );

      // Handle changes in reader connection status
      const connectionStatusListener = StripeTerminal.addDidChangeConnectionStatusListener(
        (event) => {
          // Can check event.status against constants like:
          if (event.status === StripeTerminal.ConnectionStatusConnecting) {
            this.setState({ displayText: "Connecting..." });
          }
          if (event.status === StripeTerminal.ConnectionStatusConnected) {
            this.setState({ displayText: "Connected successfully" });
          }
        }
      );

      // Handle unexpected disconnects
      const disconnectListener = StripeTerminal.addDidReportUnexpectedReaderDisconnectListener(
        (reader) => {
          this.setState({
            displayText:
              "Unexpectedly disconnected from reader " + reader.serialNumber,
          });
        }
      );

      // Pass StripeTerminal logs to the Javascript console, if needed
      const logListener = StripeTerminal.addLogListener((log) => {
        console.log("[StripeTerminal] -- " + log);
      });

      const inputListener = StripeTerminal.addDidRequestReaderInputListener(
        (text) => {
          // `text` is a prompt like "Retry Card".
          this.setState({ displayText: text });
        }
      );
    }
  }

  // componentDidUpdate() {
  //   if (this.state.locationPermission) {
  //     StripeTerminal.initialize({
  //       fetchConnectionToken: () => {
  //         alert("fetchConnectionToken");
  //         console.log("fetching connection token");
  //         return fetch("https://wadha.herokuapp.com/connection_token", {
  //           method: "POST",
  //         })
  //           .then((resp) => resp.json())
  //           .then((data) => {
  //             console.log("got data fetchConnectionToken", data);
  //             return data.secret;
  //           })
  //           .catch((err) => {
  //             alert("fetchConnectionToken " + JSON.stringify(err));
  //           });
  //       },
  //     })
  //       .then((data) => {
  //         console.log("initialize", data);
  //         return data.secret;
  //       })
  //       .catch((err) => {
  //         alert("initialize: " + JSON.stringify(err));
  //       });
  //   } else {
  //     this.askPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
  //     this.askPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  //   }
  // }

  // componentWillUnmount() {
  //   discoverListener.remove();
  //   connectionStatusListener.remove();
  //   disconnectListener.remove();
  //   logListener.remove();
  //   inputListener.remove();
  // }

  discover() {
    this.setState({ completedPayment: "discovery..." });

    StripeTerminal.discoverReaders(
      //StripeTerminal.DeviceTypeReaderSimulator,
      // StripeTerminal.DeviceTypeChipper2X,
      // StripeTerminal.DiscoveryMethodBluetoothProximity
      1,
      this.state.isSimulated ? 1 : 0
    )
      .then((readers) => {
        console.log("readers", readers);
      })
      .catch((err) => {
        console.log("error", err);
        alert("discover readers error: " + JSON.stringify(err));
      });
    console.log("discoverReaders");
  }

  createPayment() {
    this.setState({ completedPayment: "creating payment Intent" });
    StripeTerminal.createPaymentIntent({ amount: 1200, currency: "gbp" })
      .then((intent) => {
        this.setState({ completedPayment: "created payment Intent" });
        StripeTerminal.collectPaymentMethod()
          .then((intent) => {
            console.log("payment method", intent);
            this.setState({ completedPayment: "collected payment method" });
            StripeTerminal.processPayment()
              .then((intent) => {
                this.setState({ completedPayment: "payment processed" });
                console.log("payment success", intent.stripeId);
                fetch("https://wadha.herokuapp.com/capture_payment_intent", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ id: intent.stripeId }),
                })
                  .then((resp) => {
                    console.log("got data capture", resp);
                    this.setState({ completedPayment: "payment completed" });
                  })
                  .catch((err) => {
                    console.log("capture error", err);
                    this.setState({ completedPayment: err });
                    alert("capture error " + JSON.stringify(err));
                  });
              })
              .catch((err) => {
                this.setState({ completedPayment: err });
                alert("process payment error " + JSON.stringify(err));
              });
          })
          .catch((err) => {
            this.setState({ completedPayment: err });
            alert("collect payment method error " + JSON.stringify(err));
          });
      })
      .catch((err) => {
        this.setState({ completedPayment: err });
        alert("create payment intent error " + JSON.stringify(err));
      });
  }

  render() {
    return (
      <View style={styles.container}>
        {/* <Text style={styles.welcome}>{this.state.displayText}</Text> */}
        <Text style={styles.instructions}>
          Connected: {this.state.connectedReader}
        </Text>
        <Text style={styles.welcome}>
          {JSON.stringify(this.state.completedPayment)}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TextInput
            style={styles.input}
            onChangeText={(value) => {
              this.setState({ locationId: value });
            }}
            value={this.state.locationId}
            placeholder="tml_DzDeZgFF76H5lT"
          />
          <TouchableOpacity style={styles.btn} onPress={this.discover}>
            <Text style={styles.btnText}>Discover readers</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={this.createPayment}>
          <Text style={styles.btnText}>Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            console.log("state change simulation", this.state.isSimulated);
            this.setState({ isSimulated: !this.state.isSimulated });
          }}
        >
          <Text style={styles.btnText}>
            {this.state.isSimulated
              ? "un-simulate readers"
              : "simulate readers"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
  btn: {
    backgroundColor: "#9932CC",
    borderColor: "grey",
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
  },
  btnText: {
    textAlign: "center",
    color: "white",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
