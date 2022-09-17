package com.ambry;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SleepTimerModule extends ReactContextBaseJavaModule {

    ReactApplicationContext context;

    SleepTimerModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return "SleepTimerModule";
    }

    @ReactMethod
    public void setSleepTimer(Integer seconds) {
        Log.d("SleepTimerModule", "Set sleep timer called with seconds: " + seconds);

        long targetTime = SystemClock.elapsedRealtime() + (seconds * 1000L);

        Bundle bundle = new Bundle();
        bundle.putLong("targetTime", targetTime);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SleepTimerBroadcastReceiver.class);
        intent.putExtras(bundle);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, targetTime, pendingIntent);
    }

    @ReactMethod
    public void cancelSleepTimer() {
        Log.d("SleepTimerModule", "Cancel sleep timer called");

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SleepTimerBroadcastReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.cancel(pendingIntent);
    }
}
