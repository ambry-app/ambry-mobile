package com.ambry;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
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

        long targetTime = System.currentTimeMillis() + (seconds * 1000);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SleepTimerService.class);
        PendingIntent pendingIntent = PendingIntent.getService(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);

        alarmManager.setExact(AlarmManager.RTC_WAKEUP, targetTime, pendingIntent);
    }

    @ReactMethod
    public void cancelSleepTimer() {
        Log.d("SleepTimerModule", "Cancel sleep timer called");

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, SleepTimerService.class);
        PendingIntent pendingIntent = PendingIntent.getService(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);

        alarmManager.cancel(pendingIntent);
    }

}