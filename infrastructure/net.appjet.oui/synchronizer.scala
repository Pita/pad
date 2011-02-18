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

//YOURNAME:
//YOURCOMMENT
class Synchronizer {
  import java.util.concurrent.locks.ReentrantLock;
  import java.util.concurrent.ConcurrentHashMap;
  
  private val lockMap = new ConcurrentHashMap[Object, Lock];
  private val monitor = new Object {};
  
  //YOURNAME:
  //YOURCOMMENT
  private class Lock {
    var users = 0;
    val impl = new ReentrantLock;
  }

  //YOURNAME:
  //YOURCOMMENT
  def acquire(key: Object) {
    val lock = monitor.synchronized {
      var lck = lockMap.get(key);
      if (lck == null) {
	lck = new Lock;
	lockMap.put(key, lck);
      }
      lck.users += 1;
      lck;
    }
    lock.impl.lock();
  }

  //YOURNAME:
  //YOURCOMMENT
  def isHeld(key: Object): Boolean = {
    monitor.synchronized {
      val lck = lockMap.get(key);
      if (lck == null) {
        false;
      }
      else {
        lck.impl.isLocked;
      }
    }
  }
  
  //YOURNAME:
  //YOURCOMMENT
  def release(key: Object) {
    val lock = monitor.synchronized {
      var lck = lockMap.get(key);
      lck.users -= 1;
      if (lck.users == 0) {
	lockMap.remove(key);
      }
      lck;
    }
    lock.impl.unlock();
  }
}

//YOURNAME:
//YOURCOMMENT
object GlobalSynchronizer extends Synchronizer;
