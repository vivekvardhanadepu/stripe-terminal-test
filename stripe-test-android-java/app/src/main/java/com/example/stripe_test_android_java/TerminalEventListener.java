package com.example.stripe_test_android_java;

import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.ReaderEvent;

import org.jetbrains.annotations.NotNull;

public class TerminalEventListener implements TerminalListener {
    @Override
    public void onConnectionStatusChange(@NotNull ConnectionStatus connectionStatus) {
    }

    @Override
    public void onPaymentStatusChange(@NotNull PaymentStatus paymentStatus) {
    }

    @Override
    public void onUnexpectedReaderDisconnect(@NotNull Reader reader) {
    }
}
