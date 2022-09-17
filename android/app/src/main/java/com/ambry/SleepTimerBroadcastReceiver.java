package com.ambry;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;

public class SleepTimerBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("SleepTimerBroadcastReceiver", "onReceive called");

        Intent service = new Intent(context, SleepTimerTaskService.class);
        service.putExtras(intent.getExtras());

        Log.d("SleepTimerBroadcastReceiver", "starting AlarmTaskService");
        context.startService(service);
        HeadlessJsTaskService.acquireWakeLockNow(context);
    }
}
