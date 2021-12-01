package com.example.stripe_test_android_java;
import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.ContextThemeWrapper;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.external.callable.Callback;
import com.stripe.stripeterminal.external.callable.DiscoveryListener;
import com.stripe.stripeterminal.external.callable.PaymentIntentCallback;
import com.stripe.stripeterminal.log.LogLevel;
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration;
import com.stripe.stripeterminal.external.models.DiscoveryMethod;
import com.stripe.stripeterminal.external.models.PaymentIntent;
import com.stripe.stripeterminal.external.models.PaymentIntentParameters;
import com.stripe.stripeterminal.external.models.PaymentMethodType;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.TerminalException;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Nullable;

public class MainActivity extends AppCompatActivity {

    private final int REQUEST_CODE_LOCATION = 1;

    
    private final PaymentIntentParameters paymentIntentParams =
    new PaymentIntentParameters.Builder(Arrays.asList(PaymentMethodType.CARD_PRESENT))
            .setAmount(500)
            .setCurrency("gbp")
            .build();


    private final DiscoveryConfiguration discoveryConfig =
            new DiscoveryConfiguration(0, DiscoveryMethod.BLUETOOTH_SCAN, true);

    private final ReaderClickListener readerClickListener =
            new ReaderClickListener(new WeakReference<MainActivity>(this));
    private final ReaderAdapter readerAdapter = new ReaderAdapter(readerClickListener);

    /*** Payment processing callbacks ***/

    // (Step 1 found below in the startPayment function)
    // Step 2 - once we've created the payment intent, it's time to read the card
    private final PaymentIntentCallback createPaymentIntentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NotNull PaymentIntent paymentIntent) {
            Terminal.getInstance()
                    .collectPaymentMethod(paymentIntent, collectPaymentMethodCallback);
        }

        @Override
        public void onFailure(@NotNull TerminalException e) {
            // Update UI w/ failure
        }
    };

    // Step 3 - we've collected the payment method, so it's time to process the payment
    private final PaymentIntentCallback collectPaymentMethodCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NotNull PaymentIntent paymentIntent) {
            Terminal.getInstance().processPayment(paymentIntent, processPaymentCallback);
        }

        @Override
        public void onFailure(@NotNull TerminalException e) {
            // Update UI w/ failure
        }
    };

    // Step 4 - we've processed the payment! Show a success screen
    private final PaymentIntentCallback processPaymentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NotNull PaymentIntent paymentIntent) {
            try {
              ApiClient.capturePaymentIntent(paymentIntent.getId());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            runOnUiThread(() -> {
                new AlertDialog.Builder(new ContextThemeWrapper(MainActivity.this, R.style.Theme_MaterialComponents_DayNight_DarkActionBar))
                        .setMessage("Successfully captured payment!")
                        .setCancelable(true)
                        .create()
                        .show();
            });
        }

        @Override
        public void onFailure(@NotNull TerminalException e) {
            // Update UI w/ failure
        }
    };

    private void startPayment() {
        // Step 1: create payment intent
      Terminal.getInstance()
              .createPaymentIntent(paymentIntentParams, createPaymentIntentCallback);
    }

    private boolean verifyGpsEnabled() {
        final LocationManager locationManager = (LocationManager) getApplicationContext()
                .getSystemService(Context.LOCATION_SERVICE);

        boolean gpsEnabled = false;
        try {
            if (locationManager != null) {
                gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
            }
        } catch (Exception e) {}

        if (!gpsEnabled) {
            // notify user
            new AlertDialog.Builder(new ContextThemeWrapper(this, R.style.Theme_MaterialComponents_DayNight_DarkActionBar))
                    .setMessage("Please enable location services")
                    .setCancelable(false)
                    .setPositiveButton("Open location settings", (dialog, which) ->
                            startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)))
                    .create()
                    .show();
        }

        return gpsEnabled;
    }


    private void initialize() {
        // Initialize the Terminal as soon as possible
        try {
            Terminal.initTerminal(
                    getApplicationContext(), LogLevel.VERBOSE, new TokenProvider(),
                    new TerminalEventListener());
        } catch (TerminalException e) {
            throw new RuntimeException(
                    "Location services are required in order to initialize " +
                            "the Terminal.",
                    e
            );
        }

        final boolean isConnectedToReader = Terminal.getInstance().getConnectedReader() != null;
        updateReaderConnection(isConnectedToReader);
    }

    private void discoverReaders() {
        final Callback discoveryCallback = new Callback() {
            @Override
            public void onSuccess() {
                // Update your UI
            }

            @Override
            public void onFailure(@NotNull TerminalException e) {
                // Update your UI
            }
        };

        final DiscoveryListener discoveryListener = new DiscoveryListener() {
            @Override
            public void onUpdateDiscoveredReaders(@NonNull List<Reader> readers) {
                runOnUiThread(() -> readerAdapter.updateReaders((List<Reader>) readers));
            }

//            @Override
//            public void onUpdateDiscoveredReaders(@NotNull List<? extends Reader> readers) {
//                runOnUiThread(() -> readerAdapter.updateReaders((List<Reader>) readers));
//            }
        };

        Terminal.getInstance()
                .discoverReaders(discoveryConfig, discoveryListener, discoveryCallback);

    }

    void updateReaderConnection(boolean isConnected) {
        final RecyclerView recyclerView = findViewById(R.id.reader_recycler_view);

        findViewById(R.id.collect_payment_button)
                .setVisibility(isConnected ? View.VISIBLE : View.INVISIBLE);
        findViewById(R.id.discover_button)
                .setVisibility(isConnected ? View.INVISIBLE : View.VISIBLE);

        recyclerView.setVisibility(isConnected ? View.INVISIBLE : View.VISIBLE);

        if (!isConnected) {
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
            recyclerView.setAdapter(readerAdapter);
        }
    }

    // Receive the result of our permissions check, and initialize if we can
    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            @NotNull String[] permissions,
            @NotNull int[] grantResults
    ) {
        // If we receive a response to our permission check, initialize
        if (requestCode == REQUEST_CODE_LOCATION && !Terminal.isInitialized() && verifyGpsEnabled()) {
            initialize();
        }
    }



    // Upon starting, we should verify we have the permissions we need, then start the app
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        if (BluetoothAdapter.getDefaultAdapter() != null &&
                !BluetoothAdapter.getDefaultAdapter().isEnabled()) {
            BluetoothAdapter.getDefaultAdapter().enable();
        }

        findViewById(R.id.discover_button).setOnClickListener(v -> discoverReaders());
        findViewById(R.id.collect_payment_button).setOnClickListener(v -> startPayment());
    }

    @Override
    public void onResume() {
        super.onResume();

        // Check for location permissions
        final int locationPermission = ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION);
        if (locationPermission == PackageManager.PERMISSION_GRANTED) {
            if (!Terminal.isInitialized() && verifyGpsEnabled()) {
                initialize();
            }
        } else {
            // If we don't have them yet, request them before doing anything else
            final String[] permissions = { Manifest.permission.ACCESS_FINE_LOCATION };
            ActivityCompat.requestPermissions(this, permissions, REQUEST_CODE_LOCATION);
        }
    }
}
