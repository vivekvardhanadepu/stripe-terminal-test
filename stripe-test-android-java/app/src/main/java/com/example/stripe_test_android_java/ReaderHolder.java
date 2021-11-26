package com.example.stripe_test_android_java;

import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;

import org.jetbrains.annotations.NotNull;

// A simple [RecyclerView.ViewHolder] that contains a representation of each discovered reader
public class ReaderHolder extends RecyclerView.ViewHolder {
    public final MaterialButton view;

    public ReaderHolder(@NotNull MaterialButton view) {
        super(view);
        this.view = view;
    }
}
