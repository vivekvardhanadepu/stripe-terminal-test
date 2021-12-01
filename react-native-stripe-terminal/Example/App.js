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
} from "react-native";
import { PermissionsAndroid } from "react-native";
import StripeTerminal from "react-native-stripe-terminal";

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
      completedPayment: null,
      displayText: "Loading...",
    };

    this.discover = this.discover.bind(this);
    this.createPayment = this.createPayment.bind(this);

    (async () => {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted) {
        console.log("You can use the ACCESS_FINE_LOCATION");
      } else {
        (async function requestLocationPermission() {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: "Example App",
                message: "Example App access to your location ",
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("You can use the location");
              alert("You can use the location");
            } else {
              console.log("location permission denied");
              alert("Location permission denied");
            }
          } catch (err) {
            console.warn(err);
          }
        })();
        console.log("ACCESS_FINE_LOCATION permission denied");
      }

      StripeTerminal.initialize({
        fetchConnectionToken: () => {
          console.log("fetching connection token");
          return fetch("https://4c8a-49-204-189-63.ngrok.io/connection_token", {
            method: "POST",
          })
            .then((resp) => resp.json())
            .then((data) => {
              console.log("got data", data);
              return data.secret;
            });
        },
      });

      // StripeTerminal.addDidChangeConnectionStatusListener(({ status }) => {
      //   console.log("status change", status);
      //   this.setState({
      //     readerConnected: status === StripeTerminal.ConnectionStatusConnected,
      //   });
      // });

      // StripeTerminal.addDidDisconnectUnexpectedlyFromReaderListener(() => {
      //   this.setState({ displayText: "Disconnected unexpectedly! Oh noez" });
      // });

      // StripeTerminal.addDidBeginWaitingForReaderInputListener(({ text }) => {
      //   this.setState({ displayText: text });
      // });

      // StripeTerminal.addDidRequestReaderInputPromptListener(({ text }) => {
      //   this.setState({ displayText: text });
      // });

      StripeTerminal.addReadersDiscoveredListener((readers) => {
        console.log("readers discovered", readers);
        if (
          readers.length &&
          !this.state.readerConnected &&
          !this.state.isConnecting
        ) {
          this.setState({ isConnecting: true });
          StripeTerminal.connectReader(readers[0].serialNumber)
            .then(() => {
              this.setState({ isConnecting: false });
            })
            .catch((e) => console.log("failed to connect", e));
        }
      });
    })();
  }

  discover() {
    this.setState({ completedPayment: "discovery..." });
    console.log("discovering");
    console.log(StripeTerminal);
    StripeTerminal.discoverReaders(
      StripeTerminal.DeviceTypeChipper2X,
      StripeTerminal.DiscoveryMethodBluetoothProximity,
      // 220,
      // StripeTerminal.DiscoveryMethodBluetoothScan,
      1
    )
      .then((resp) => {
        console.log("resp", resp);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  createPayment() {
    StripeTerminal.createPaymentIntent({ amount: 1200, currency: "gbp" })
      .then((intent) => {
        this.setState({ completedPayment: intent });
      })
      .catch((err) => {
        this.setState({ completedPayment: err });
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{this.state.displayText}</Text>
        <Text style={styles.instructions}>
          Connected: {this.state.readerConnected}
        </Text>
        <Text style={styles.instructions}>
          {JSON.stringify(this.state.completedPayment)}
        </Text>

        <TouchableOpacity onPress={this.discover}>
          <Text>Discover readers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.createPayment}>
          <Text>Create payment</Text>
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
});
