package com.example.stripe_test_android_java;

import androidx.annotation.NonNull;

import com.stripe.stripeterminal.external.callable.BluetoothReaderListener;
import com.stripe.stripeterminal.external.callable.Cancelable;
import com.stripe.stripeterminal.external.models.ReaderDisplayMessage;
import com.stripe.stripeterminal.external.models.ReaderInputOptions;
import com.stripe.stripeterminal.external.models.ReaderEvent;
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate;
import com.stripe.stripeterminal.external.models.TerminalException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class TerminalBluetoothReaderListener implements BluetoothReaderListener {
    @Override
    public void onRequestReaderInput(@NotNull ReaderInputOptions readerInputOptions) {
    }

    @Override
    public void onRequestReaderDisplayMessage(@NotNull ReaderDisplayMessage readerDisplayMessage) {
    }

    @Override
    public void onStartInstallingUpdate(@NotNull ReaderSoftwareUpdate update, @NotNull Cancelable cancelable) {
        // Show UI communicating that a required update has started installing
    }

    @Override
    public void onReportReaderSoftwareUpdateProgress(float progress) {
        // Update the progress of the install
    }

    @Override
    public void onFinishInstallingUpdate(@Nullable ReaderSoftwareUpdate update, @Nullable TerminalException e) {
        // Report success or failure of the update
    }

    @Override
    public void onReportAvailableUpdate(@NonNull ReaderSoftwareUpdate readerSoftwareUpdate) {

    }

    @Override
    public void onReportLowBatteryWarning() {

    }

    @Override
    public void onReportReaderEvent(@NonNull ReaderEvent readerEvent) {

    }
}
