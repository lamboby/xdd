/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.ice.itrustoor;

import java.io.FileOutputStream;

import android.content.Context;
import android.os.Bundle;

import org.apache.cordova.*;

import com.tencent.android.tpush.XGIOperateCallback;
import com.tencent.android.tpush.XGPushManager;

public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
    	XGPushManager.registerPush(getApplicationContext(),
    			new XGIOperateCallback() {
    		@Override
    		public void onSuccess(Object data, int flag) {
    			String filename = "openid.txt";
   			    String stropenid = (String) data;
    			FileOutputStream outputStream;

    			try {
    				outputStream = openFileOutput(filename, Context.MODE_PRIVATE);
    				outputStream.write(stropenid.getBytes());
    				outputStream.close();
    			} 
    			catch (Exception e) {
    				e.printStackTrace();
    			}

    		}
    		@Override
    		public void onFail(Object data, int errCode, String msg) {
				
    		}
    	});
    	super.onCreate(savedInstanceState);
        super.init();
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }
}
