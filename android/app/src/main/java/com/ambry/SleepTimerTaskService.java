package com.ambry;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

public class SleepTimerTaskService extends HeadlessJsTaskService {

    @Override
    protected @Nullable
    HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Log.d("SleepTimerTaskService", "getTaskConfig called");

        Bundle extras = intent.getExtras();
        if (extras != null) {
            Log.d("SleepTimerTaskService", "returned task config");

            return new HeadlessJsTaskConfig(
                    "SleepTimerTask",
                    Arguments.fromBundle(extras),
                    45000, // timeout for the task
                    true // optional: defines whether or not  the task is allowed in foreground. Default is false
            );
        }

        Log.d("SleepTimerTaskService", "returned null!");
        return null;
    }
}
