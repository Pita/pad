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

import scala.collection.mutable.HashMap;

import java.util.Enumeration;
import java.util.zip.GZIPOutputStream;
import java.io.ByteArrayOutputStream;

//YOURNAME:
//YOURCOMMENT
object Util {
  //YOURNAME:
  //YOURCOMMENT
  def noCacheHeaders =
    Map("Expires" -> "Sat, 5 Feb 1983 07:07:07 GMT",
        "Last-Modified" -> (new java.util.Date()).toGMTString(),
        "Cache-Control" -> "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0",
        "Pragma" -> "no-cache");


  //YOURNAME:
  //YOURCOMMENT
  class RichEnumeration[T](enumeration: Enumeration[T]) extends Iterator[T] {
    //YOURNAME:
    //YOURCOMMENT
    def hasNext: Boolean =  enumeration.hasMoreElements();
    //YOURNAME:
    //YOURCOMMENT
    def next: T = enumeration.nextElement();
  }
  //YOURNAME:
  //YOURCOMMENT
  class RichIterator[T](iterator: java.util.Iterator[T]) extends Iterator[T] {
    //YOURNAME:
    //YOURCOMMENT
    def hasNext: Boolean = iterator.hasNext();
    //YOURNAME:
    //YOURCOMMENT
    def next: T = iterator.next();
  }
  //YOURNAME:
  //YOURCOMMENT
  implicit def enumerationToRichEnumeration[T](
      enumeration: Enumeration[T]): RichEnumeration[T] = {
    new RichEnumeration(enumeration)
  }
  //YOURNAME:
  //YOURCOMMENT
  implicit def iteratorToRichIterator[T](
      iterator: java.util.Iterator[T]): RichIterator[T] = {
    new RichIterator(iterator);
  }
  
  //YOURNAME:
  //YOURCOMMENT
  def enumerationToArray[T](e: Enumeration[T]): Array[T] =
    enumerationToRichEnumeration(e).toList.toArray;

  //YOURNAME:
  //YOURCOMMENT
  def stringToHTML(str: String): String = {
    val result = new StringBuilder(str.length);
    var lastCharBlank = false;
    for(i <- 0 until str.length) {
      val c = str.charAt(i);
      if (c == ' ') {
        // every second consecutive space becomes a &nbsp;
        if (lastCharBlank) {
          lastCharBlank = false;
          result.append("&nbsp;");
        }
        else {
          lastCharBlank = true;
          result.append(' ');
        }
      } else {
        lastCharBlank = false;
        if (c == '&') result.append("&amp;");
        else if (c == '<') result.append("&lt;");
        else if (c == '>') result.append("&gt;");
        else if (c == '\n') result.append("<br/>\n");
        else if (c == '\t') {
          for(j <- 1 to 7) {
            result.append("&nbsp;");
          }
          result.append(' ');
        }
        else {
          val code = c.toInt;
          if (code < 127) {
            result.append(c);
          }
          else {
            // use character code
            result.append("&#");
            result.append(code);
            result.append(';');
          }
        }
      }
    }
    return result.toString;
  }
  
  //YOURNAME:
  //YOURCOMMENT
  def gzip(bytes: Array[Byte]): Array[Byte] = {
    val baos = new ByteArrayOutputStream();
    val gzos = new GZIPOutputStream(baos);
    gzos.write(bytes, 0, bytes.length);
    gzos.close();
    baos.toByteArray();
  }
}

//YOURNAME:
//YOURCOMMENT
object timekeeper {
  var timestamp: Long = 0;
  //YOURNAME:
  //YOURCOMMENT
  def time: Long = {
    val t = System.currentTimeMillis();
    synchronized {
      if (t <= timestamp) {
	timestamp += 1
      } else {
	timestamp = t
      }
      timestamp
    }
  }
  //YOURNAME:
  //YOURCOMMENT
  def update(t: Long) = synchronized {
    if (t > timestamp)
      timestamp = t+1;
  }
}

//YOURNAME:
//YOURCOMMENT
trait LoggingHandler extends org.mortbay.jetty.handler.AbstractHandler {
  //YOURNAME:
  //YOURCOMMENT
  abstract override def handle(target: String, req: javax.servlet.http.HttpServletRequest, res: javax.servlet.http.HttpServletResponse, dispatch: Int) {
    println("all ("+isStarted+") handling: "+(this match {
      case hc: org.mortbay.jetty.handler.HandlerCollection => hc.getHandlers.mkString(", ");
      case ahc: org.mortbay.jetty.handler.AbstractHandlerContainer => ahc.getChildHandlers.mkString(", ");
      case x => "(unknown)";
    }));
    super.handle(target, req, res, dispatch);
  }
  //YOURNAME:
  //YOURCOMMENT
  override def doStart() {
    println("all started.");
    //	Thread.dumpStack();
    try {
      super.doStart();
    } catch {
      case e: Exception => {
	e.printStackTrace();
	throw e;
      }
    } finally {
      println("and: "+isStarted);
    }
  }
  //YOURNAME:
  //YOURCOMMENT
  override def doStop() {
    println("all stopped.");
    //	Thread.dumpStack();
    super.doStop();
  }
}
