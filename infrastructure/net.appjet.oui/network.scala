/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.appjet.oui;

import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.jetty.security.{SslSelectChannelConnector, SslHttpChannelEndPoint};
import org.mortbay.io.nio.SelectorManager;
import org.mortbay.io.Buffers;
import javax.net.ssl.SSLEngine;

import java.nio.channels.{SocketChannel, SelectionKey};


//YOURNAME:
//YOURCOMMENT
trait KnowsAboutDispatch extends SelectChannelConnector.ConnectorEndPoint {

  //YOURNAME:
  //YOURCOMMENT
  def isDispatched: Boolean;
}


//YOURNAME:
//YOURCOMMENT
class CometConnectorEndPoint(channel: SocketChannel, selectSet: SelectorManager#SelectSet, key: SelectionKey)
    extends SelectChannelConnector.ConnectorEndPoint(channel, selectSet, key) with KnowsAboutDispatch {

  //YOURNAME:
  //YOURCOMMENT
  def isDispatched = _dispatched;
}


//YOURNAME:
//YOURCOMMENT
class CometSelectChannelConnector extends SelectChannelConnector {
  override
 //YOURNAME:
 //YOURCOMMENT
 def newEndPoint(channel: SocketChannel, selectSet: SelectorManager#SelectSet, key: SelectionKey) =
    new CometConnectorEndPoint(channel, selectSet, key);
}


//YOURNAME:
//YOURCOMMENT
class CometSslHttpChannelEndPoint(buffers: Buffers, channel: SocketChannel, selectSet: SelectorManager#SelectSet, 
				  key: SelectionKey, engine: SSLEngine)
    extends SslHttpChannelEndPoint(buffers, channel, selectSet, key, engine) with KnowsAboutDispatch {

  //YOURNAME:
  //YOURCOMMENT
  def isDispatched = _dispatched;
}


//YOURNAME:
//YOURCOMMENT
class CometSslSelectChannelConnector extends SslSelectChannelConnector {
  override
 //YOURNAME:
 //YOURCOMMENT
 def newEndPoint(channel: SocketChannel, selectSet: SelectorManager#SelectSet, key: SelectionKey) =
    new CometSslHttpChannelEndPoint(this, channel, selectSet, key, createSSLEngine());
}
