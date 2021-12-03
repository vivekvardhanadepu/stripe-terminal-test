package com.example.stripe_test_android_java;

import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.external.callable.ReaderCallback;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.TerminalException;

import org.jetbrains.annotations.NotNull;

import java.lang.ref.WeakReference;

public class ReaderClickListener {
    @NotNull
    private final WeakReference<MainActivity> activityRef;

    public ReaderClickListener(@NotNull WeakReference<MainActivity> weakReference) {
        activityRef = weakReference;
    }

    public void onClick(@NotNull Reader reader) {
      // When connecting to a physical reader, your integration should specify either the
      // same location as the last connection (reader.locationId) or a new location
      // of your user's choosing.
      //
      // Since the simulated reader is not associated with a real location, we recommend
      // specifying its existing mock location.
      String locationId="tml_DzDeZgFF76H5lT";
//      if (reader.getRegisteredLocation() != null) {
//          locationId = reader.getRegisteredLocation().getId();
//      } else {
//          // The reader is not associated with a location. Insert business logic here to determine
//          // where the reader should be registered, and pass the location ID to the reader.
//          throw new RuntimeException("No location ID available");
//      }

      ConnectionConfiguration.BluetoothConnectionConfiguration connectionConfig =
            new ConnectionConfiguration.BluetoothConnectionConfiguration(locationId);

        Terminal.getInstance().connectBluetoothReader(
            reader,
            connectionConfig,
            new TerminalBluetoothReaderListener(),
            new ReaderCallback() {
                @Override
                public void onSuccess(@NotNull Reader reader) {
                    final MainActivity activity = activityRef.get();
                    if (activity != null) {
                        activity.runOnUiThread(() -> {
                            // Update UI w/ connection success
                            activity.updateReaderConnection(true);
                        });
                    }
                }

                @Override
                public void onFailure(@NotNull TerminalException e) {
                    final MainActivity activity = activityRef.get();
                    if (activity != null) {
                        activity.runOnUiThread(() -> {
                            // Update UI w/ connection failure
                        });
                    }
                }
            }
        );
  }
}

